import {
	engineDef,
	TransitionAction,
	UpdateAction,
	type AppTransition,
	type AppUpdate
} from '@rizz-zone/chat-shared'
import { schema } from '@rizz-zone/chat-shared/auth_server'
import { appTransitionSchema } from '@rizz-zone/chat-shared/schema'
import { desc } from 'drizzle-orm'
import { UpdateImpact } from 'ground0'
import {
	SyncEngineBackend,
	type BackendAutoruns,
	type BackendTransitionHandlers
} from 'ground0/durable_object'

export class UserSpace extends SyncEngineBackend<AppTransition, AppUpdate> {
	protected override engineDef = engineDef
	protected override appTransitionSchema = appTransitionSchema
	protected override autoruns: BackendAutoruns = {
		onConnect: (id) =>
			this.update(
				{
					action: UpdateAction.InitLatestThreads,
					impact: UpdateImpact.Unreliable
				},
				{ target: id }
			)
	}

	protected override backendHandlers = {
		[TransitionAction.SendMessage]: {
			confirm: () => {
				return true
			}
		}
	} satisfies BackendTransitionHandlers<AppTransition>

	public async supplyChatPrefills() {
		// temp
		const threads = await this.db
			.select()
			.from(schema.thread)
			.orderBy(desc(schema.thread.createdAt))
			.limit(20)
		return { threads }
	}
}
