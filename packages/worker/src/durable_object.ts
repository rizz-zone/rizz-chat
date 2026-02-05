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
import { ms } from 'ms'

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

	/**
	 * Mark this DO as a disposable (anonymous) session and schedule
	 * self-deletion after 28 days. Called once when the session is first
	 * created.
	 */
	public async markDisposable() {
		await this.ctx.storage.put('disposable', true)
		await this.ctx.storage.setAlarm(Date.now() + ms('28d'))
	}

	/**
	 * Push the self-deletion alarm back by 28 days. Called when the client's
	 * JWT is refreshed (i.e. they visited again after 14+ days).
	 */
	public async refreshDisposableAlarm() {
		const isDisposable = await this.ctx.storage.get<boolean>('disposable')
		if (isDisposable) {
			await this.ctx.storage.setAlarm(Date.now() + ms('28d'))
		}
	}

	/** Whether this DO belongs to a disposable (anonymous) session. */
	public async isDisposable(): Promise<boolean> {
		return (await this.ctx.storage.get<boolean>('disposable')) ?? false
	}

	/**
	 * Alarm handler. If this is a disposable session whose alarm has fired
	 * (meaning no refresh happened in time), wipe all storage so the DO can
	 * be garbage-collected.
	 */
	override async alarm() {
		const isDisposable = await this.ctx.storage.get<boolean>('disposable')
		if (isDisposable) {
			await this.ctx.storage.deleteAll()
		}
	}
}
