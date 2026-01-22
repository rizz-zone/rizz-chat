import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

export async function handle({ event, resolve }) {
  // Get session and populate locals for SSR
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  event.locals.session = session?.session ?? null;
  event.locals.user = session?.user ?? null;

  // Better Auth handles all /api/auth/* routes automatically
  return svelteKitHandler({ event, resolve, auth, building });
}
