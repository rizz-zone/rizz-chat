/// <reference types="bun-types" />

// Use a simple relative path so we don't depend on Node resolution types.
const envPath = new URL('../.env', import.meta.url).pathname
const examplePath = new URL('../.env.example', import.meta.url).pathname

const example = Bun.file(examplePath)

if (!(await example.exists())) {
	// Nothing to do if there is no example file.
	process.exit()
}

const currentEnv = Bun.file(envPath)

if (await currentEnv.exists()) {
	// Respect any existing local .env file.
	process.exit()
}

await Bun.write(envPath, example)
