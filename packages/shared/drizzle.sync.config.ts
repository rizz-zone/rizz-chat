import { defineConfig } from 'drizzle-kit'

// Sync engine database schema config
export default defineConfig({
	dialect: 'sqlite',
	driver: 'durable-sqlite',
	schema: './src/sync_db/schema.ts',
	out: './src/sync_db/generated'
})
