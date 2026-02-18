# AGENTS.md

## Monorepo Structure

- `packages/shared` — auth, DB schemas, Ground0 engine defs, types shared across the stack; built with `tsdown`
- `packages/worker` — Cloudflare Workers + Durable Objects backend (`UserSpace` DO, `DOBackend` entrypoint)
- `packages/web` — SvelteKit frontend (Cloudflare Pages adapter)
- pnpm workspaces; catalog-based dep pinning in `pnpm-workspace.yaml`; Turbo for task orchestration

## TypeScript / Linting

- All packages: `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- ESLint: `typescript-eslint` strict; unused vars are errors (prefix `_` to suppress)
- **Do not use `any` or `!` (non-null assertion)**
- **`as SomeType` casting technically compiles but is strongly discouraged** — it bypasses type safety silently; only use it as a genuine last resort, with a comment explaining why it's safe; almost always there is a better approach
- Path alias: `@/*` → `src/*` in all packages

## Architecture

### Worker / Web Integration

- Backend worker is **not** accessed by its dev port — only via Cloudflare **service binding** (`platform.env.DO_BACKEND`)
- Web routes to worker: `/api/ws` (WebSocket upgrade), `supplyChatPrefills()` (SSR prefetch via RPC)
- Worker routes requests into per-user/session `UserSpace` Durable Objects

### ground0 Sync Engine

- Local-first sync library; client and server exchange typed `AppTransition` / `AppUpdate` messages
- Defs live in `packages/shared/src/defs/`
- **Use deepwiki or read source before assuming behavior** — don't guess at ground0 APIs; balance that against not asking about every trivial thing that you _can_ safely infer
- Database schema changes require migration scripts; engine version tracked via package.json
- Locally, this means there is a memory model and a WASM SQLite database

### Databases

- Auth DB: Turso (LibSQL cloud) — BetterAuth tables only
- Sync DB: per-Durable-Object SQLite — threads/messages; managed by ground0

### shared Package Build

- `shared` is a built package (`dist/`) — if you add or change **anything exported** from it (including types), run `pnpm build` inside `packages/shared` before other packages can use those exports
- `check-types` in turbo has `^build` dependency so it will rebuild, but if iterating locally you may need to trigger it manually

## After Completing Work

Run these **sequentially** (not in parallel — both invoke build steps):

```
pnpm check-types
pnpm lint
```

This verifies types, runs svelte-check, runs eslint, and also implicitly validates the build. Leaving type or lint errors behind is not acceptable, even if you do not believe you caused them.

At the very end, since it's hard to fix styling and accidentally break the lint and type check in the process (unlike the other way around), run:

```
pnpm style
```

You can use `pnpm style:write` to automatically fix issues. Similar rules apply re: who caused it — this should always be fixed.

## Maintaining Agent Documentation

- If something is critical enough that nearly every task would benefit from knowing it → add it to this file (AGENTS.md)
- Everything else → `agent_docs/` (prefer editing existing files over creating new ones)
- When adding or changing a doc, update the TOC below; TOC entries should be descriptive enough that another agent can decide whether to read that file
- If a doc is something like a problem, a future agent won't immediately know what the cause is, so you should explain contents by symptoms / prompts, not the solution

## Agent Docs TOC

| File                                             | Contents                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`agent_docs/drizzle.md`](agent_docs/drizzle.md) | Drizzle ORM gotchas; issue causing cross-package type errors (check if there is a seemingly impossible to explain type mismatch involving drizzle between two packages) |
