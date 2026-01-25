import type { SyncEngineDefinition } from 'ground0'
import type { AppTransition, AppUpdate } from './types'
import { version } from '../../package.json'
import migrations from '@/db/generated/migrations'

export const engineDef = {
	version: {
		current: version
	},
	transitions: {
		sharedHandlers: {}
	},
	db: { migrations }
} satisfies SyncEngineDefinition<AppTransition, AppUpdate>
