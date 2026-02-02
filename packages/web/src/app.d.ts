import type { DOBackend } from '@rizz-zone/chat-worker'
import type { Session, User } from 'better-auth'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env & {
				// Service binding - typed as Service for RPC support
				// Note: In dev, Miniflare requires URL string as first arg to fetch()
				DO_BACKEND: Service<DOBackend>
			}
			ctx: ExecutionContext
			caches: CacheStorage
			cf?: IncomingRequestCfProperties
		}
		interface Locals {
			session: Session
			user: User
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
