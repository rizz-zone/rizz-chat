import { schema } from '@rizz-zone/chat-shared/auth_server'
import { genAuthServer } from '@rizz-zone/chat-shared/auth_server'
import {
	extractDisposableSessionId,
	signDisposableSessionJwt,
	buildDisposableSessionCookieHeader
} from '@rizz-zone/chat-shared/disposable_session'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { uuidv7 } from 'uuidv7'
import type { BackendChatPrefills } from '@rizz-zone/chat-shared/types'

// Local Env type to avoid conflicts when imported from other packages
type WorkerEnv = Cloudflare.Env

export { UserSpace } from './durable_object'

export default class DOBackend extends WorkerEntrypoint<WorkerEnv> {
	private readonly auth
	constructor(ctx: ExecutionContext, env: WorkerEnv) {
		super(ctx, env)

		this.auth = genAuthServer(
			env.BASE_URL,
			drizzle(
				createClient({
					url: env.DATABASE_URL,
					authToken:
						'DATABASE_AUTH_TOKEN' in env &&
						typeof env.DATABASE_AUTH_TOKEN === 'string'
							? env.DATABASE_AUTH_TOKEN
							: undefined
				}),
				{ schema }
			),
			env.BETTER_AUTH_SECRET,
			{
				X_API_KEY: env.X_API_KEY,
				X_API_SECRET: env.X_API_SECRET,
				DISCORD_CLIENT_ID: env.DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET: env.DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET
			}
		)
	}

	public override async fetch(request: Request) {
		const ns = this.env.USERSPACE

		const session = await this.auth.api.getSession({
			headers: request.headers
		})

		// Authenticated user — route to their DO
		if (session) {
			const id = ns.idFromName(session.user.id)
			const stub = ns.get(id)
			return stub.fetch(request)
		}

		// Try existing disposable session cookie
		const result = await extractDisposableSessionId(
			request.headers.get('cookie'),
			this.env.DISPOSABLE_SESSION_SECRET
		)

		if (result) {
			const id = ns.idFromName(result.sessionId)
			const stub = ns.get(id)
			return stub.fetch(request)
		}

		// No auth at all — create a new disposable session inline
		const sessionId = uuidv7()
		const id = ns.idFromName(sessionId)
		const stub = ns.get(id)
		await stub.markDisposable()

		const jwt = await signDisposableSessionJwt(
			sessionId,
			this.env.DISPOSABLE_SESSION_SECRET
		)

		const response = await stub.fetch(request)

		// Clone the response so we can append the Set-Cookie header
		const mutableResponse = new Response(response.body, response)
		const isSecure = new URL(request.url).protocol === 'https:'
		mutableResponse.headers.append(
			'Set-Cookie',
			buildDisposableSessionCookieHeader(jwt, isSecure)
		)
		return mutableResponse
	}

	public supplyBackendChatPrefills(
		spaceId: string
	): Promise<BackendChatPrefills> {
		const id = this.env.USERSPACE.idFromName(spaceId)
		const stub = this.env.USERSPACE.get(id)
		return stub.supplyBackendChatPrefills()
	}

	/**
	 * Initialise a new disposable session. Marks the DO as disposable and
	 * schedules a 28-day self-deletion alarm.
	 */
	public async initDisposableSession(sessionId: string): Promise<void> {
		const id = this.env.USERSPACE.idFromName(sessionId)
		const stub = this.env.USERSPACE.get(id)
		await stub.markDisposable()
	}

	/**
	 * Refresh a disposable session — pushes the self-deletion alarm back by
	 * 28 days and returns the current chat prefills.
	 */
	public async refreshDisposableSession(sessionId: string) {
		const id = this.env.USERSPACE.idFromName(sessionId)
		const stub = this.env.USERSPACE.get(id)
		await stub.refreshDisposableAlarm()
	}
}
