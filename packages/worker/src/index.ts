import {
	engineDef,
	TransitionAction,
	type AppTransition,
	type AppUpdate
} from '@rizz-zone/chat-shared'
import { appTransitionSchema } from '@rizz-zone/chat-shared/schema'
import { WorkerEntrypoint } from 'cloudflare:workers'
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
	public override fetch(request: Request) {
		const id = this.env.USERSPACE.idFromName('temp')
		const stub = this.env.USERSPACE.get(id)

		return stub.fetch(request)
	}
}
