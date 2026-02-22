import type { thread } from '@/sync_db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export type Thread = InferSelectModel<typeof thread>
