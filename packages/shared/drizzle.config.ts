import { defineConfig } from 'drizzle-kit'

// Auth database schema config
export default defineConfig({
	dialect: 'turso',
	schema: './src/db/schema.ts',
	out: './src/db/generated'
})
