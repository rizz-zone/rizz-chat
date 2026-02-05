# rizz chat

A [t3.chat](https://t3.chat) replacement built on [ground0](https://github.com/rizz-zone/ground0) — reliable, local-first, optionally E2EE.

## Architecture

### Stack
- **Frontend:** SvelteKit
- **Backend:** Cloudflare Workers + Durable Objects
- **Sync:** ground0 (sqlite wasm + DO backend)
- **Auth:** better-auth (Google, Discord, X/Twitter)

### Session Model

Two user types:

1. **Authenticated users** — DO space keyed by user ID, persistent forever
2. **Anonymous (disposable) sessions** — JWT-based, auto-cleanup after 28 days of inactivity

```
┌─────────────────────────────────────────────────────────────┐
│ Anonymous User Flow                                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Visit → no cookie → create disposable session            │
│ 2. Mint JWT (sessionId, iat, exp=28d), set cookie           │
│ 3. Call DO.markDisposable() → schedules 28-day alarm        │
│ 4. Return after 14+ days → refresh JWT + reset alarm        │
│ 5. Inactive 28 days → alarm fires → DO.deleteAll()          │
└─────────────────────────────────────────────────────────────┘
```

Why:
- Crawlers/bots don't create persistent DOs (no cost)
- Anonymous users get full functionality without signup
- Inactive sessions auto-cleanup (28-day TTL)

### Key Files

```
packages/
├── shared/          # Types, schemas, engine definition
│   └── src/defs/    # AppTransition, AppUpdate enums
├── web/             # SvelteKit frontend
│   └── src/lib/
│       ├── server/ssr/supply_chat_prefills.ts  # JWT + DO orchestration
│       └── sync.ts                              # ground0 client
└── worker/          # Cloudflare Worker + DO
    └── src/
        ├── durable_object.ts   # UserSpace DO
        └── index.ts            # Worker entrypoint
```

## Development

```bash
pnpm install
pnpm dev        # runs turbo dev
```

## Status

**Branch:** `functional-for-one-user`

✅ Done:
- better-auth integration (OAuth)
- Disposable session lifecycle
- DO lazy creation (ws connect only)
- SSR prefills from DO
- ground0 sync wired up

🚧 Remaining:
- Actual chat UI (not test buttons)
- Message storage + display
- Thread creation/selection
- AI response integration
- E2EE layer (optional feature)

## License

MIT
