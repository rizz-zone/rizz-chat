# CLAUDE.md - Project Context for AI Agents

> **IMPORTANT**: If you learn something new about this project that would be useful for future agents, **edit this file** to include it. This file should always be kept up to date with relevant project knowledge.

## Project Overview

**Rizz Chat** - A chat interface application inspired by T3 Chat but with a simpler, more minimal aesthetic. Red theme, black background, slate/grey sidebar.

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5 (uses runes: `$state`, `$derived`, `$effect`, `$props`)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/forms` and `@tailwindcss/typography` plugins
- **Icons**: `svelte-bootstrap-icons` - use `width` and `height` props (NOT `size`)
- **Database**: Drizzle ORM with LibSQL (Turso)
- **Authentication**: Better Auth with JWT tokens for cross-origin auth
- **Real-time**: Cloudflare Durable Objects for WebSocket connections
- **Deployment**: Cloudflare Workers via `@sveltejs/adapter-cloudflare`
- **Monorepo**: pnpm workspace with Turbo

## Project Structure

```
rizz_chat/
├── packages/
│   ├── web/           # Main SvelteKit app (auth server)
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── components/     # UI components
│   │       │   ├── stores/         # Svelte stores (.svelte.ts files)
│   │       │   ├── server/
│   │       │   │   ├── auth.ts     # Better Auth server config
│   │       │   │   └── db/         # Drizzle schema and db connection
│   │       │   └── auth-client.ts  # Better Auth client (browser)
│   │       ├── hooks.server.ts     # SvelteKit hooks (auth handler)
│   │       └── routes/
│   │           ├── chat/           # Chat routes (/chat, /chat/[chatId])
│   │           └── layout.css      # Global styles and theme
│   ├── worker/        # Cloudflare Worker API (Durable Objects)
│   │   └── src/
│   │       ├── index.ts            # Worker entry + ChatRoom DO
│   │       └── auth.ts             # JWT verification utilities
│   └── shared/        # Shared types/utilities
│       └── src/
│           └── auth.ts             # Shared auth types
```

## Key Conventions

### Svelte 5 Patterns

- Use `$props()` for component props with TypeScript interfaces
- Use `$state()` for reactive state
- Use `$derived()` for computed values
- For HTML element prop types, use `SvelteHTMLElements` - it's excellent for typing

### Styling

- Theme colors defined in `packages/web/src/routes/layout.css` using `@theme` block
- Color naming: `accent-*` (red), `surface-*` (backgrounds), `text-*`, `border-*`
- Custom utility classes: `btn-accent` (button with inset ring), `input-floating` (floating input style)

### Icons

```svelte
import PlusLg from 'svelte-bootstrap-icons/lib/PlusLg.svelte';
<PlusLg width={16} height={16} />
```

**Note**: Do NOT use `size` prop - it doesn't exist. Always use `width` and `height`.

### State Management

- Chat state lives in `$lib/stores/chat.svelte.ts`
- Uses Svelte 5 runes for reactivity
- Example data is pre-populated for demo purposes

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server (from root or packages/web)

# Type checking
pnpm check                  # Run svelte-check (from packages/web)

# Database
pnpm db:push               # Push schema changes
pnpm db:studio             # Open Drizzle Studio

# Worker (from packages/worker)
pnpm dev                    # Start worker dev server on port 8787
pnpm types                  # Generate worker types
```

## Authentication

Uses **Better Auth** for authentication with JWT tokens for cross-service auth.

### Architecture

- **SvelteKit (web)**: Auth server - handles login, signup, session management, issues JWTs
- **Worker (DO)**: API server - verifies JWTs via JWKS endpoint, handles WebSocket connections

### Key Files

- `packages/web/src/lib/server/auth.ts` - Better Auth server configuration
- `packages/web/src/lib/auth-client.ts` - Browser auth client with JWT support
- `packages/web/src/lib/server/db/schema.ts` - Drizzle schema (user, session, account, verification, jwks tables)
- `packages/worker/src/auth.ts` - JWT verification utilities (uses `jose` library)

### Auth Flow

1. User authenticates via SvelteKit (`/api/auth/*` routes handled by Better Auth)
2. Browser calls `authClient.token()` to get a JWT
3. Browser connects to Worker WebSocket with `?token=<jwt>` query param
4. Worker verifies JWT via JWKS endpoint (`/api/auth/.well-known/jwks.json`)
5. On success, WebSocket connection is established with user identity

### Environment Variables

**Web package** (`.env`):

- `APP_URL` / `PUBLIC_APP_URL` - SvelteKit app URL (auth server)
- `API_URL` / `PUBLIC_API_URL` - Worker API URL
- `BETTER_AUTH_SECRET` - Session signing secret
- `COOKIE_DOMAIN` - Optional, for cross-subdomain cookies (e.g., `.rizz.zone`)

**Worker package** (set in `wrangler.jsonc` or via `wrangler secret`):

- `AUTH_URL` - SvelteKit app URL (for JWKS verification)
- `CORS_ORIGIN` - SvelteKit app URL (for CORS headers)

### Usage in Components

```typescript
// Get current session (SSR-safe)
import { page } from '$app/state'
const user = $derived(page.data.user)

// Sign in
import { signIn } from '$lib/auth-client'
await signIn.email({ email, password })

// Get JWT for API calls
import { getAuthHeaders } from '$lib/auth-client'
const headers = await getAuthHeaders()
fetch(`${PUBLIC_API_URL}/api/me`, { headers })

// Connect to WebSocket
import { token } from '$lib/auth-client'
const { data } = await token()
const ws = new WebSocket(`${PUBLIC_API_URL}/room/123?token=${data.token}`)
```

## Current Features

- Sidebar with chat list (grouped by date: Today, Yesterday, Last 7 Days, Older)
- Collapsible sidebar with toggle button
- Floating message input with model picker and plan indicator
- URL-based routing (`/chat` for new, `/chat/[chatId]` for existing)
- Red accent theme with inset ring on buttons

## Known Patterns to Follow

1. **Route structure**: Use `/chat` for the main chat interface, `/chat/[chatId]` for individual chats
2. **Component location**: Put shared components in `$lib/components/`, page-specific in route folders
3. **Imports**: Use `$lib/` alias for lib imports, `$app/` for SvelteKit utilities

## Resources for Research

- Use **context7** or **deepwiki** MCP tools for researching libraries - they're better than general web search
- Svelte 5 docs: https://svelte.dev/docs/svelte
- SvelteKit docs: https://svelte.dev/docs/kit
