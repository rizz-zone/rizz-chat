import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter, type DB } from 'better-auth/adapters/drizzle'
import { lastLoginMethod } from 'better-auth/plugins'

export const genAuthServer = (
	db: DB,
	secret: string,
	apiKeys: {
		X_API_KEY: string
		X_API_SECRET: string
		DISCORD_CLIENT_ID: string
		DISCORD_CLIENT_SECRET: string
		GOOGLE_CLIENT_ID: string
		GOOGLE_CLIENT_SECRET: string
	}
) =>
	betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite'
		}),
		socialProviders: {
			twitter: {
				clientId: apiKeys.X_API_KEY,
				clientSecret: apiKeys.X_API_SECRET
			},
			discord: {
				clientId: apiKeys.DISCORD_CLIENT_ID,
				clientSecret: apiKeys.DISCORD_CLIENT_SECRET
			},
			google: {
				clientId: apiKeys.GOOGLE_CLIENT_ID,
				clientSecret: apiKeys.GOOGLE_CLIENT_SECRET
			}
		},
		plugins: [lastLoginMethod({ storeInDatabase: true }), passkey()],
		secret
	})
