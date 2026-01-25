import { error } from '@sveltejs/kit'
import type { RequestHandler } from '../../chat/$types'

export const GET: RequestHandler = async ({ platform, url, request }) => {
	if (!platform) error(500, 'No platform!')
	const requestInit: RequestInit = {
		method: request.method,
		headers: request.headers
	}
	// Check if the incoming request is an upgrade request to websocket
	const upgradeHeader = request.headers.get('upgrade')
	if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
		error(400, 'This endpoint only supports websocket upgrade requests.')
	}
	return await platform.env.DO_BACKEND.fetch(url, requestInit)
}
