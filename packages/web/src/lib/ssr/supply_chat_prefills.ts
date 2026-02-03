import type { Cookies } from '@sveltejs/kit'
import { jwtVerify, SignJWT } from 'jose'
import { uuidv7 } from 'uuidv7'
import { ms } from 'ms'
import { dev } from '$app/environment'
import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from '@rizz-zone/chat-shared/auth_server'

export async function supplyChatPrefills({
	platform,
	locals,
	cookies,
	disposableSessionSecret: rawDisposableSessionSecret
}: {
	platform: Readonly<App.Platform>
	locals: Readonly<App.Locals>
	cookies: Cookies
	disposableSessionSecret: string
}): Promise<{
	threads: InferSelectModel<typeof schema.thread>[]
	redirectToDefaultThread: boolean
}> {
	if (locals.user) {
		return {
			...(await platform.env.DO_BACKEND.supplyChatPrefills(locals.user.id)),
			redirectToDefaultThread: false
		}
	}
	const disposableSessionJwt = cookies.get('disposable_session')
	const secret = new TextEncoder().encode(rawDisposableSessionSecret)
	if (!disposableSessionJwt) {
		const jwt = await new SignJWT({ sessionId: uuidv7() })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('28d')
			.sign(secret)
		cookies.set('disposable_session', jwt, {
			path: '/',
			expires: new Date(Date.now() + ms('28d')),
			secure: !dev,
			sameSite: 'lax',
			httpOnly: true
		})
		return {
			// TODO: Provide default threads
			threads: [],
			redirectToDefaultThread: true
		}
	}
	jwtVerify(disposableSessionJwt, secret) // ...
	// TODO: Build logic for what to do with an existing disposable session jwt
	return {
		threads: [],
		redirectToDefaultThread: true
	}
}
