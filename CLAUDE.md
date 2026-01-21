# CLAUDE.md - Project Context for AI Agents

> **IMPORTANT**: If you learn something new about this project that would be useful for future agents, **edit this file** to include it. This file should always be kept up to date with relevant project knowledge.

## Project Overview

**Rizz Chat** - A chat interface application inspired by T3 Chat but with a simpler, more minimal aesthetic. Red theme, black background, slate/grey sidebar.

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5 (uses runes: `$state`, `$derived`, `$effect`, `$props`)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/forms` and `@tailwindcss/typography` plugins
- **Icons**: `svelte-bootstrap-icons` - use `width` and `height` props (NOT `size`)
- **Database**: Drizzle ORM with LibSQL (Turso)
- **Deployment**: Cloudflare Workers via `@sveltejs/adapter-cloudflare`
- **Monorepo**: pnpm workspace with Turbo

## Project Structure

```
rizz_chat/
├── packages/
│   ├── web/           # Main SvelteKit app
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── components/     # UI components
│   │       │   ├── stores/         # Svelte stores (.svelte.ts files)
│   │       │   └── server/db/      # Drizzle schema and db connection
│   │       └── routes/
│   │           ├── chat/           # Chat routes (/chat, /chat/[chatId])
│   │           └── layout.css      # Global styles and theme
│   ├── worker/        # Cloudflare Worker backend
│   └── shared/        # Shared types/utilities
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
