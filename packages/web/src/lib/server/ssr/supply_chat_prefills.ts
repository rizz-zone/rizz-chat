import type { Cookies } from '@sveltejs/kit'
import { jwtVerify, SignJWT, errors } from 'jose'
import { uuidv7 } from 'uuidv7'
import { ms } from 'ms'
import { dev } from '$app/environment'
import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from '@rizz-zone/chat-shared/auth_server'
import { isDisposableSessionJwtPayload } from '../types/security/DisposableSessionJwtPayload'
import { SchemaNotSatisfiedError } from '../errors'

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
	// Authenticated user — use their user ID as the DO space
	if (locals.user) {
		return {
			...(await platform.env.DO_BACKEND.supplyChatPrefills(locals.user.id)),
			redirectToDefaultThread: false
		}
	}

	const secret = new TextEncoder().encode(rawDisposableSessionSecret)
	const disposableSessionJwt = cookies.get('disposable_session')

	// No existing session — create a fresh disposable session
	if (!disposableSessionJwt) {
		return await createDisposableSession({ platform, cookies, secret })
	}

	// Existing session — verify the JWT
	try {
		const { payload } = await jwtVerify(disposableSessionJwt, secret)
		if (!isDisposableSessionJwtPayload(payload))
			throw new SchemaNotSatisfiedError()
		const { sessionId, iat } = payload

		// Refresh the JWT if it was issued more than 14 days ago.
		// This extends the cookie + DO alarm by another 28 days.
		const ageMs = Date.now() - iat * 1000
		if (ageMs > ms('14d')) {
			return await refreshDisposableSession({
				platform,
				cookies,
				secret,
				sessionId
			})
		}

		// Valid and fresh — just fetch prefills from the DO
		return {
			...(await platform.env.DO_BACKEND.supplyChatPrefills(sessionId)),
			redirectToDefaultThread: false
		}
	} catch (err) {
		// Expired or tampered JWT — start a completely fresh session
		if (
			err instanceof errors.JWTExpired ||
			err instanceof errors.JWSInvalid ||
			err instanceof errors.JWTClaimValidationFailed ||
			err instanceof SchemaNotSatisfiedError
		) {
			return await createDisposableSession({ platform, cookies, secret })
		}
		throw err
	}
}

/** Helper to sign a disposable session JWT and set it as a cookie. */
async function signAndSetDisposableSessionJWT({
	cookies,
	secret,
	sessionId
}: {
	cookies: Cookies
	secret: Uint8Array
	sessionId: string
}) {
	const jwt = await new SignJWT({ sessionId })
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
}

/** Mint a brand-new disposable session JWT and initialise the backing DO. */
async function createDisposableSession({
	platform,
	cookies,
	secret
}: {
	platform: Readonly<App.Platform>
	cookies: Cookies
	secret: Uint8Array
}) {
	const sessionId = uuidv7()
	await signAndSetDisposableSessionJWT({ cookies, secret, sessionId })

	// Tell the DO it's disposable so it can schedule self-deletion
	await platform.env.DO_BACKEND.initDisposableSession(sessionId)

	return {
		threads: [] as InferSelectModel<typeof schema.thread>[],
		redirectToDefaultThread: true
	}
}

/** Re-sign the JWT with a fresh iat/exp, and reset the DO's self-deletion alarm. */
async function refreshDisposableSession({
	platform,
	cookies,
	secret,
	sessionId
}: {
	platform: Readonly<App.Platform>
	cookies: Cookies
	secret: Uint8Array
	sessionId: string
}) {
	await signAndSetDisposableSessionJWT({ cookies, secret, sessionId })

	// Push the DO's self-deletion alarm back by 28 days
	const prefills =
		await platform.env.DO_BACKEND.refreshDisposableSession(sessionId)

	return {
		...prefills,
		redirectToDefaultThread: false
	}
}
