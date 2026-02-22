import type { BackendChatPrefills } from '@rizz-zone/chat-shared/types'

export type Prefills = BackendChatPrefills & {
	redirectToDefaultThread: boolean
}
