import { env } from '$env/dynamic/private'
import { genAuthServer } from '@rizz-zone/chat-shared/auth_server'
import { db } from './db'

export const auth = genAuthServer(db, env.BETTER_AUTH_SECRET, {
	X_API_KEY: env.X_API_KEY,
	X_API_SECRET: env.X_API_SECRET,
	DISCORD_CLIENT_ID: env.DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET: env.DISCORD_CLIENT_SECRET,
	GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET
})
