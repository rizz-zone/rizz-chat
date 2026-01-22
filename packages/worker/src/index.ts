import { authenticateRequest, unauthorizedResponse, verifyToken } from './auth'
import type { AuthJwtPayload } from './auth'

export interface Env {
	// Durable Object bindings
	CHAT_ROOM: DurableObjectNamespace
	// Environment variables
	AUTH_URL: string
	CORS_ORIGIN: string
}

// CORS headers helper
function corsHeaders(origin: string): HeadersInit {
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Credentials': 'true'
	}
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url)
		const cors = corsHeaders(env.CORS_ORIGIN)

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: cors })
		}

		// Route to chat room
		if (url.pathname.startsWith('/room/')) {
			const roomId = url.pathname.split('/')[2]
			if (!roomId) {
				return new Response('Room ID required', { status: 400, headers: cors })
			}

			// Get or create the Durable Object for this room
			const id = env.CHAT_ROOM.idFromName(roomId)
			const stub = env.CHAT_ROOM.get(id)

			// Forward the request to the Durable Object
			// Pass AUTH_URL in a header so the DO can verify tokens
			const doRequest = new Request(request.url, request)
			doRequest.headers.set('X-Auth-URL', env.AUTH_URL)

			const response = await stub.fetch(doRequest)

			// Add CORS headers to response
			const newResponse = new Response(response.body, response)
			Object.entries(cors).forEach(([key, value]) => {
				newResponse.headers.set(key, value)
			})
			return newResponse
		}

		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({ status: 'ok' }), {
				headers: { ...cors, 'Content-Type': 'application/json' }
			})
		}

		// Protected API example
		if (url.pathname === '/api/me') {
			const user = await authenticateRequest(request, env)
			if (!user) {
				return unauthorizedResponse()
			}
			return new Response(JSON.stringify({ user }), {
				headers: { ...cors, 'Content-Type': 'application/json' }
			})
		}

		return new Response('Not Found', { status: 404, headers: cors })
	}
}

/**
 * ChatRoom Durable Object
 *
 * Handles real-time chat via WebSocket connections.
 * Authenticates users via JWT on connection.
 */
export class ChatRoom implements DurableObject {
	private sessions: Map<WebSocket, AuthJwtPayload> = new Map()
	private state: DurableObjectState

	constructor(state: DurableObjectState) {
		this.state = state
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)
		const authUrl = request.headers.get('X-Auth-URL') || ''

		// WebSocket upgrade
		if (request.headers.get('Upgrade') === 'websocket') {
			// Get token from query param (common pattern for WS auth)
			const token = url.searchParams.get('token')
			if (!token) {
				return new Response('Token required', { status: 401 })
			}

			// Verify the token
			const user = await verifyToken(token, { AUTH_URL: authUrl })
			if (!user) {
				return new Response('Invalid token', { status: 401 })
			}

			// Create WebSocket pair
			const pair = new WebSocketPair()
			const [client, server] = Object.values(pair)

			// Accept the WebSocket and store user info
			this.state.acceptWebSocket(server)
			this.sessions.set(server, user)

			// Broadcast user joined
			this.broadcast({
				type: 'user_joined',
				user: { id: user.sub, name: user.name, email: user.email }
			})

			return new Response(null, { status: 101, webSocket: client })
		}

		// HTTP endpoints for the room
		if (url.pathname.endsWith('/info')) {
			const users = Array.from(this.sessions.values()).map((u) => ({
				id: u.sub,
				name: u.name
			}))
			return new Response(JSON.stringify({ users, count: users.length }), {
				headers: { 'Content-Type': 'application/json' }
			})
		}

		return new Response('Not Found', { status: 404 })
	}

	async webSocketMessage(
		ws: WebSocket,
		message: string | ArrayBuffer
	): Promise<void> {
		const user = this.sessions.get(ws)
		if (!user) {
			ws.close(1008, 'Not authenticated')
			return
		}

		try {
			const data = JSON.parse(message as string)

			// Handle different message types
			switch (data.type) {
				case 'chat':
					this.broadcast({
						type: 'chat',
						user: { id: user.sub, name: user.name },
						content: data.content,
						timestamp: Date.now()
					})
					break

				case 'ping':
					ws.send(JSON.stringify({ type: 'pong' }))
					break

				default:
					ws.send(
						JSON.stringify({ type: 'error', message: 'Unknown message type' })
					)
			}
		} catch {
			ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
		}
	}

	async webSocketClose(ws: WebSocket): Promise<void> {
		const user = this.sessions.get(ws)
		if (user) {
			this.sessions.delete(ws)
			this.broadcast({
				type: 'user_left',
				user: { id: user.sub, name: user.name }
			})
		}
	}

	async webSocketError(ws: WebSocket): Promise<void> {
		this.sessions.delete(ws)
	}

	private broadcast(message: object): void {
		const json = JSON.stringify(message)
		for (const ws of this.sessions.keys()) {
			try {
				ws.send(json)
			} catch {
				// Connection might be closed, will be cleaned up in webSocketClose
			}
		}
	}
}
