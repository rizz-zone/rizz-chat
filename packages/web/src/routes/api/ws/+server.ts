import { error } from '@sveltejs/kit'
import type { RequestHandler } from '../../chat/$types'

export const GET: RequestHandler = async ({ platform, request }) => {
	if (!platform) error(500, 'No platform!')

	// Check if the incoming request is an upgrade request to websocket
	const upgradeHeader = request.headers.get('upgrade')
	if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
		error(400, 'This endpoint only supports websocket upgrade requests.')
	}
	// Miniflare bug: service binding fetch doesn't accept Request objects directly,
	// must pass URL string as first argument
	const doResponse = await platform.env.DO_BACKEND.fetch(request.url, request)

	// For WebSocket upgrades (101), return original response with webSocket property
	// Node.js Response doesn't allow status 101, and we need the webSocket intact
	if (doResponse.status === 101) {
		return doResponse as unknown as Response
	}

	// For non-upgrade responses, wrap to ensure SvelteKit compatibility
	// (Miniflare returns _Response which may fail instanceof checks)
	return new Response(doResponse.body, {
		status: doResponse.status,
		statusText: doResponse.statusText,
		headers: doResponse.headers
	})
}
