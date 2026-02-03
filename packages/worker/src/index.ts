import {
	engineDef,
	TransitionAction,
	type AppTransition,
	type AppUpdate
} from '@rizz-zone/chat-shared'
import { schema } from '@rizz-zone/chat-shared/auth_server'
import { genAuthServer } from '@rizz-zone/chat-shared/auth_server'
import { appTransitionSchema } from '@rizz-zone/chat-shared/schema'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import {
	SyncEngineBackend,
	type BackendTransitionHandlers
} from 'ground0/durable_object'

// Local Env type to avoid conflicts when imported from other packages
type WorkerEnv = Cloudflare.Env

export class UserSpace extends SyncEngineBackend<AppTransition, AppUpdate> {
	protected override engineDef = engineDef
	protected override appTransitionSchema = appTransitionSchema

	protected override backendHandlers = {
		[TransitionAction.SendMessage]: {
			confirm: () => {
				return true
			}
		}
	} satisfies BackendTransitionHandlers<AppTransition>
}

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
}
