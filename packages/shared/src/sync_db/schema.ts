import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { uuidv7 } from 'uuidv7'

export const thread = sqliteTable('thread', {
	id: text().primaryKey().$defaultFn(uuidv7),
	createdAt: integer({ mode: 'timestamp_ms' }),
	lastMutatedAt: integer({ mode: 'timestamp_ms' }),
	name: text()
})
export const message = sqliteTable('message', {
	id: text().primaryKey().$defaultFn(uuidv7),
	createdAt: integer({ mode: 'timestamp_ms' }),
	content: text(),
	threadId: text().references(() => thread.id)
})
