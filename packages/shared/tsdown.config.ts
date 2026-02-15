import { defineConfig } from 'tsdown'
import sqlRawPlugin from 'vite-plugin-sql-raw'

export default defineConfig({
	exports: true,
	dts: true,
	unbundle: true,
	target: 'esnext',
	platform: 'neutral',
	sourcemap: true,
	entry: {
		index: 'src/index.ts',
		schema: 'src/schema.ts',
		auth_server: 'src/auth_server.ts',
		disposable_session: 'src/disposable_session.ts'
	},
	plugins: [sqlRawPlugin()]
})
