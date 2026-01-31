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
		authServer: 'src/auth_server.ts'
	},
	plugins: [sqlRawPlugin()]
})
