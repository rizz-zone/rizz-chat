/// <reference lib="DOM" />

import { SignJWT, jwtVerify } from 'jose'
import { ms } from 'ms'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import {
	isDisposableSessionJwtPayload,
	type DisposableSessionJwtPayload
} from '@/types/DisposableSessionJwtPayload'

// Constants
export const DISPOSABLE_COOKIE_NAME = 'disposable_session'
export const DISPOSABLE_MAX_AGE = '28d'
export const DISPOSABLE_REFRESH_AGE = '14d'

/**
 * Create a signed disposable-session JWT for the given session ID.
 *
 * @param sessionId The disposable session identifier.
 * @param secret HMAC secret used to sign the token.
 * @returns A signed JWT string.
 */
export async function signDisposableSessionJwt(
	sessionId: string,
	secret: string
): Promise<string> {
	return new SignJWT({ sessionId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(DISPOSABLE_MAX_AGE)
		.sign(new TextEncoder().encode(secret))
}

/**
 * Verify a disposable-session JWT and extract its payload.
 *
 * @param jwt The JWT string to verify.
 * @param secret HMAC secret used to verify the signature.
 * @returns The validated payload with `sessionId` and `iat`.
 * @throws If the token is invalid or the payload shape is wrong.
 */
export async function verifyDisposableSessionJwt(
	jwt: string,
	secret: string
): Promise<DisposableSessionJwtPayload> {
	const { payload } = await jwtVerify(jwt, new TextEncoder().encode(secret))
	if (!isDisposableSessionJwtPayload(payload))
		throw new Error('Invalid disposable session JWT payload')
	return { sessionId: payload.sessionId, iat: payload.iat }
}

/**
 * Extract and verify a disposable-session JWT from a raw `Cookie` header.
 *
 * @param rawCookieHeader The raw `Cookie` header string, or `null` if absent.
 * @param secret HMAC secret used to verify the token.
 * @returns The validated payload, or `null` if missing or invalid.
 */
export async function extractDisposableSessionId(
	rawCookieHeader: string | null,
	secret: string
): Promise<DisposableSessionJwtPayload | null> {
	if (!rawCookieHeader) return null
	const cookies = parseCookie(rawCookieHeader)
	const token = cookies[DISPOSABLE_COOKIE_NAME]
	if (!token) return null
	try {
		return await verifyDisposableSessionJwt(token, secret)
	} catch {
		return null
	}
}

/**
 * Build a `Set-Cookie` header string for the disposable-session JWT.
 *
 * @param jwt The disposable-session JWT.
 * @param secure Whether to set the `Secure` flag on the cookie.
 * @returns A serialized `Set-Cookie` header value.
 */
export function buildDisposableSessionCookieHeader(
	jwt: string,
	secure: boolean
): string {
	return serializeCookie(DISPOSABLE_COOKIE_NAME, jwt, {
		path: '/',
		expires: new Date(Date.now() + ms(DISPOSABLE_MAX_AGE)),
		secure,
		sameSite: 'lax',
		httpOnly: true
	})
}
