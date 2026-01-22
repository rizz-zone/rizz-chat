/**
 * Shared auth types for both web and worker packages
 */

/**
 * JWT payload structure from Better Auth
 */
export interface AuthJwtPayload {
	/** User ID */
	sub: string
	/** User email */
	email?: string
	/** User display name */
	name?: string
	/** Issued at timestamp */
	iat?: number
	/** Expiration timestamp */
	exp?: number
	/** Issuer (the auth server URL) */
	iss?: string
	/** Audience (the API URL) */
	aud?: string | string[]
}

/**
 * Authenticated user info (subset of JWT payload)
 */
export interface AuthUser {
	id: string
	email?: string
	name?: string
}

/**
 * Convert JWT payload to AuthUser
 */
export function jwtPayloadToUser(payload: AuthJwtPayload): AuthUser {
	return {
		id: payload.sub,
		email: payload.email,
		name: payload.name
	}
}

/**
 * WebSocket message types for chat
 */
export type WsMessageType =
	| 'chat'
	| 'user_joined'
	| 'user_left'
	| 'ping'
	| 'pong'
	| 'error'

/**
 * Base WebSocket message structure
 */
export interface WsMessage {
	type: WsMessageType
}

/**
 * Chat message
 */
export interface WsChatMessage extends WsMessage {
	type: 'chat'
	user: AuthUser
	content: string
	timestamp: number
}

/**
 * User joined message
 */
export interface WsUserJoinedMessage extends WsMessage {
	type: 'user_joined'
	user: AuthUser
}

/**
 * User left message
 */
export interface WsUserLeftMessage extends WsMessage {
	type: 'user_left'
	user: AuthUser
}

/**
 * Error message
 */
export interface WsErrorMessage extends WsMessage {
	type: 'error'
	message: string
}

/**
 * All WebSocket message union type
 */
export type WsAnyMessage =
	| WsChatMessage
	| WsUserJoinedMessage
	| WsUserLeftMessage
	| WsErrorMessage
	| { type: 'ping' }
	| { type: 'pong' }
