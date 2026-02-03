import type { PageServerLoad } from './$types'
import { supplyChatPrefills } from '$lib/ssr/supply_chat_prefills'
import { error } from '@sveltejs/kit'

export const load = (async ({ platform, locals, cookies }) => {
	if (!platform) error(500, 'No platform!')
	const chatPrefills = await supplyChatPrefills({ platform, locals, cookies })
	return { chatPrefills }
}) satisfies PageServerLoad
