import type { Cookies } from '@sveltejs/kit'
import { errors } from 'jose'
import { uuidv7 } from 'uuidv7'
import { ms } from 'ms'
import { dev } from '$app/environment'
import {
	DISPOSABLE_COOKIE_NAME,
	DISPOSABLE_MAX_AGE,
	DISPOSABLE_REFRESH_AGE,
	verifyDisposableSessionJwt,
	signDisposableSessionJwt
} from '@rizz-zone/chat-shared/disposable_session'
import type { Prefills } from '$lib/types/Prefills'

export async function supplyChatPrefills({
	platform,
	locals,
	cookies,
	disposableSessionSecret
}: {
	platform: Readonly<App.Platform>
	locals: Readonly<App.Locals>
	cookies: Cookies
	disposableSessionSecret: string
}): Promise<Prefills> {
	// Authenticated user — use their user ID as the DO space
	if (locals.user) {
		return {
			...(await platform.env.DO_BACKEND.supplyBackendChatPrefills(
				locals.user.id
			)),
			redirectToDefaultThread: false
		}
	}

	const disposableSessionJwt = cookies.get(DISPOSABLE_COOKIE_NAME)

	// No existing session — create a fresh disposable session
	if (!disposableSessionJwt) {
		await createDisposableSession({
			platform,
			cookies,
			disposableSessionSecret
		})
		return {
			threads: [],
			redirectToDefaultThread: true
		}
	}

	// Existing session — verify the JWT
	try {
		const { sessionId, iat } = await verifyDisposableSessionJwt(
			disposableSessionJwt,
			disposableSessionSecret
		)

		// Refresh the JWT if it was issued more than 14 days ago.
		// This extends the cookie + DO alarm by another 28 days.
		const ageMs = Date.now() - iat * 1000
		if (ageMs > ms(DISPOSABLE_REFRESH_AGE)) {
			await refreshDisposableSession({
				platform,
				cookies,
				disposableSessionSecret,
				sessionId
			})
		}

		// Valid and fresh — just fetch prefills from the DO
		return {
			...(await platform.env.DO_BACKEND.supplyBackendChatPrefills(sessionId)),
			redirectToDefaultThread: false
		}
	} catch (err) {
		// Expired or tampered JWT — start a completely fresh session
		if (
			err instanceof errors.JWTExpired ||
			err instanceof errors.JWSInvalid ||
			err instanceof errors.JWTClaimValidationFailed ||
			err instanceof Error
		) {
			await createDisposableSession({
				platform,
				cookies,
				disposableSessionSecret
			})
			return {
				threads: [],
				redirectToDefaultThread: true
			}
		}
		throw err
	}
}

/** Helper to sign a disposable session JWT and set it as a cookie. */
async function signAndSetDisposableSessionJWT({
	cookies,
	disposableSessionSecret,
	sessionId
}: {
	cookies: Cookies
	disposableSessionSecret: string
	sessionId: string
}) {
	const jwt = await signDisposableSessionJwt(sessionId, disposableSessionSecret)

	cookies.set(DISPOSABLE_COOKIE_NAME, jwt, {
		path: '/',
		expires: new Date(Date.now() + ms(DISPOSABLE_MAX_AGE)),
		secure: !dev,
		sameSite: 'lax',
		httpOnly: true
	})
}

/** Mint a brand-new disposable session JWT and initialise the backing DO. */
async function createDisposableSession({
	platform,
	cookies,
	disposableSessionSecret
}: {
	platform: Readonly<App.Platform>
	cookies: Cookies
	disposableSessionSecret: string
}) {
	const sessionId = uuidv7()
	await signAndSetDisposableSessionJWT({
		cookies,
		disposableSessionSecret,
		sessionId
	})

	// Tell the DO it's disposable so it can schedule self-deletion
	await platform.env.DO_BACKEND.initDisposableSession(sessionId)
}

/** Re-sign the JWT with a fresh iat/exp, and reset the DO's self-deletion alarm. */
async function refreshDisposableSession({
	platform,
	cookies,
	disposableSessionSecret,
	sessionId
}: {
	platform: Readonly<App.Platform>
	cookies: Cookies
	disposableSessionSecret: string
	sessionId: string
}) {
	await signAndSetDisposableSessionJWT({
		cookies,
		disposableSessionSecret,
		sessionId
	})

	// Push the DO's self-deletion alarm back by 28 days
	await platform.env.DO_BACKEND.refreshDisposableSession(sessionId)
}
