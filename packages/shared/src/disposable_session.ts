import { SignJWT, jwtVerify } from 'jose'
import { ms } from 'ms'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import { number, object, refine, uuidv7, type z } from 'zod/mini'

// ── Constants ────────────────────────────────────────────────────────
export const DISPOSABLE_COOKIE_NAME = 'disposable_session'
export const DISPOSABLE_MAX_AGE = '28d'
export const DISPOSABLE_REFRESH_AGE = '14d'

// ── Schema ───────────────────────────────────────────────────────────
export const DisposableSessionJwtPayloadSchema = object({
	iat: number().check(refine((num) => num < (Date.now() + ms('28d')) / 1000)),
	sessionId: uuidv7()
})
export type DisposableSessionJwtPayload = z.infer<
	typeof DisposableSessionJwtPayloadSchema
>
export const isDisposableSessionJwtPayload = (
	value: unknown
): value is DisposableSessionJwtPayload =>
	DisposableSessionJwtPayloadSchema.safeParse(value).success

// ── Sign ─────────────────────────────────────────────────────────────
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

// ── Verify ───────────────────────────────────────────────────────────
export async function verifyDisposableSessionJwt(
	jwt: string,
	secret: string
): Promise<{ sessionId: string; iat: number }> {
	const { payload } = await jwtVerify(
		jwt,
		new TextEncoder().encode(secret)
	)
	if (!isDisposableSessionJwtPayload(payload))
		throw new Error('Invalid disposable session JWT payload')
	return { sessionId: payload.sessionId, iat: payload.iat }
}

// ── Extract from Cookie header ───────────────────────────────────────
export async function extractDisposableSessionId(
	rawCookieHeader: string | null,
	secret: string
): Promise<{ sessionId: string; iat: number } | null> {
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

// ── Build Set-Cookie header ──────────────────────────────────────────
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
