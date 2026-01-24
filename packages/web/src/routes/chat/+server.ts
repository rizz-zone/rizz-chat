import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform) error(500, 'No platform!')
	// const res = await platform.env.DO_BACKEND.fetch('http://localhost:8787')
	// return new Response(await res.text())
	const theString = platform.env.DO_BACKEND.rpcTest()
	console.log(theString)
	console.log(typeof theString)
	return new Response(theString)
}
