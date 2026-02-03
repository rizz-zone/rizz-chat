import { schema } from '@rizz-zone/chat-shared/auth_server'
import { genAuthServer } from '@rizz-zone/chat-shared/auth_server'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import type { InferSelectModel } from 'drizzle-orm'

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
					authToken: env.DATABASE_AUTH_TOKEN
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
		const session = await this.auth.api.getSession({
			headers: request.headers
		})
		if (session) console.debug(session.user.email)
		else console.debug('No session')

		const id = this.env.USERSPACE.idFromName('temp')
		const stub = this.env.USERSPACE.get(id)

		return stub.fetch(request)
	}

	public supplyChatPrefills(spaceId: string): Promise<{
		threads: InferSelectModel<typeof schema.thread>[]
	}> {
		const id = this.env.USERSPACE.idFromName(spaceId)
		const stub = this.env.USERSPACE.get(id)
		return stub.supplyChatPrefills()
	}
}
