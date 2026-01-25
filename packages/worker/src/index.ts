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

export default class DOBackend extends WorkerEntrypoint {
	public override fetch() {
		return new Response('secret string...')
	}
}
