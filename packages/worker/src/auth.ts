import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

// Cache for JWKS to avoid fetching on every request
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null
let jwksCacheUrl: string | null = null

/**
 * Better Auth JWT payload structure
 */
export interface AuthJwtPayload extends JWTPayload {
	sub: string // User ID
	email?: string
	name?: string
}

/**
 * Get or create a cached JWKS instance
 */
function getJWKS(authUrl: string): ReturnType<typeof createRemoteJWKSet> {
	const jwksUrl = `${authUrl}/api/auth/.well-known/jwks.json`

	if (jwksCache && jwksCacheUrl === jwksUrl) {
		return jwksCache
	}

	jwksCache = createRemoteJWKSet(new URL(jwksUrl))
	jwksCacheUrl = jwksUrl
	return jwksCache
}

/**
 * Verify a JWT token from Better Auth
 *
 * @param token - The JWT token (without "Bearer " prefix)
 * @param env - Environment with AUTH_URL
 * @returns The decoded payload with user info, or null if invalid
 */
export async function verifyToken(
	token: string,
	env: { AUTH_URL: string }
): Promise<AuthJwtPayload | null> {
	try {
		const jwks = getJWKS(env.AUTH_URL)

		const { payload } = await jwtVerify(token, jwks, {
			// Issuer should match the auth server URL
			issuer: env.AUTH_URL
			// We don't strictly verify audience since it might vary
		})

		return payload as AuthJwtPayload
	} catch (error) {
		console.error('JWT verification failed:', error)
		return null
	}
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
	const auth = request.headers.get('Authorization')
	if (!auth?.startsWith('Bearer ')) {
		return null
	}
	return auth.slice(7)
}

/**
 * Authenticate a request and return the user payload
 *
 * @param request - The incoming request
 * @param env - Environment with AUTH_URL
 * @returns The authenticated user payload, or null if not authenticated
 */
export async function authenticateRequest(
	request: Request,
	env: { AUTH_URL: string }
): Promise<AuthJwtPayload | null> {
	const token = extractBearerToken(request)
	if (!token) {
		return null
	}
	return verifyToken(token, env)
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): Response {
	return new Response(JSON.stringify({ error: message }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' }
	})
}
