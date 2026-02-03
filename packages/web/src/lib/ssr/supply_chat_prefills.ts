import type { Cookies } from '@sveltejs/kit'

export async function supplyChatPrefills({
	platform,
	locals,
	cookies
}: {
	platform: Readonly<App.Platform>
	locals: Readonly<App.Locals>
	cookies: Cookies
}) {
	if (locals.user) {
		return await platform.env.DO_BACKEND.supplyChatPrefills(locals.user.id)
	}
}
