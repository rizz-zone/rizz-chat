import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import svelteKitWebSockets from 'vite-plugin-sveltekit-cf-websockets'

export default defineConfig({
	plugins: [
		tailwindcss(),
		svelteKitWebSockets({ verbose: true }),
		sveltekit(),
		devtoolsJson()
	],
	define: {
		__WS_URL__: JSON.stringify(
			process.env.PUBLIC_WS_URL ?? 'ws://localhost:5173/api/ws'
		)
	}
})
