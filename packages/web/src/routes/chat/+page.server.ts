import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { StatusCodes } from 'http-status-codes'
import { resolve } from '$app/paths'

export const load = (async () => {
	redirect(StatusCodes.MOVED_PERMANENTLY, resolve('/'))
}) satisfies PageServerLoad
