import type { AppTransition } from '@rizz-zone/chat-shared'
import type { MemoryModel } from './MemoryModel'
import { createSyncEngine } from '@ground0/adapter-svelte'
import { wasmUrl } from 'ground0/wasm'
import { fetchWasmFromUrl } from 'ground0'
import { dev } from '$app/environment'

const Worker = URL
export const engine = createSyncEngine<AppTransition, MemoryModel>({
	workerUrl: dev
		? new URL('./worker.ts', import.meta.url)
		: new Worker(new URL('./worker.ts', import.meta.url)),
	dbWorkerUrl: dev
		? new URL('./db_worker.ts', import.meta.url)
		: new Worker(new URL('./db_worker.ts', import.meta.url)),
	pullWasmBinary: fetchWasmFromUrl(wasmUrl)
})
