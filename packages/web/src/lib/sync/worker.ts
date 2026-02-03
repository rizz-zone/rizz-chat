import { workerEntrypoint } from 'ground0/worker'
import type { MemoryModel } from './MemoryModel'
import {
	engineDef,
	TransitionAction,
	UpdateAction,
	type AppTransition,
	type AppUpdate
} from '@rizz-zone/chat-shared'

let wsUrl: string
try {
	wsUrl = __WS_URL__
} catch {
	wsUrl = 'ws://localhost:5173/api/ws'
}

workerEntrypoint<MemoryModel, AppTransition, AppUpdate>({
	engineDef,
	wsUrl,
	dbName: 'chat',
	initialMemoryModel: {
		threadsFromEarliest: [],
		successfulySentMessages: 0
	},
	localTransitionHandlers: {
		[TransitionAction.SendMessage]: {
			editMemoryModel: ({ memoryModel }) => {
				memoryModel.successfulySentMessages += 1
			},
			revertMemoryModel: ({ memoryModel }) => {
				memoryModel.successfulySentMessages -= 1
			}
		}
	},
	updateHandlers: {
		[UpdateAction.InitLatestThreads]: ({ memoryModel }) => {
			memoryModel.threadsFromEarliest.push('arusnyt')
		}
	}
})

declare const __WS_URL__: string
