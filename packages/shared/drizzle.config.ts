/// <reference types="bun-types" />

import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

// Auth database schema config
export default defineConfig({
	dialect: 'turso',
	schema: './src/db/schema.ts',
	out: './src/db/generated',
	dbCredentials: {
		url: process.env.DATABASE_URL,
		authToken: process.env.DATABASE_AUTH_TOKEN
	}
})
