# AGENTS Instructions

## Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server (all packages)
bun run build        # Build all packages
bun run lint         # Lint with Oxlint
bun run format       # Format with Oxfmt (run after every change)
bun run typecheck    # Type-check all packages
bun run unit         # Run unit tests
```

## Development

The dev server proxies published GitBook sites locally. After `bun dev`, access any published site at:

```
http://localhost:3000/url/<published-gitbook-url>
```

Examples:
- `http://localhost:3000/url/gitbook.com/docs`
- `http://localhost:3000/url/open-source.gitbook.io/midjourney`

### PPR routes

PPR requests are normally resolved upstream and arrive with a large set of `x-gbo-*` headers, so they
can't be reproduced by hitting the dev server directly. `bun run dev:ppr` (from `packages/gitbook`)
starts a dev-only proxy on port 3001 that resolves the URL and injects those headers:

```
http://localhost:3001/url/<published-gitbook-url>
```

Responses carry `x-gitbook-route-type: ppr` when the PPR route was used. Hot reload doesn't work
through the proxy (its websocket can't be forwarded), so keep using port 3000 while iterating.

## Architecture

```
packages/
  gitbook/          # Main Next.js app
    src/
      app/          # Next.js App Router (sites/)
      components/   # React components
      lib/          # Server utilities, data fetching
      intl/         # Internationalization (translations/)
  openapi-parser/   # OpenAPI 3.0/3.1/Swagger parser
  react-openapi/    # OpenAPI rendering components
  react-contentkit/ # ContentKit component rendering
  embed/            # Embeddable GitBook components
  shared/           # Shared utilities
  icons/            # Icon assets
  fonts/            # Font assets
  colors/           # Color tokens
  expr/             # GitBook expression evaluator
  cache-do/         # Cloudflare DO cache
  cache-tags/       # Cache tag utilities
```

## Testing

```bash
bun run unit         # Unit tests via bun test (not vitest)
bun run e2e          # Playwright e2e tests (requires built app)
```

Run a specific test file:
```bash
cd packages/gitbook && bun test src/lib/cache.test.ts
```

## Changesets

After committing code changes, create a changeset for the affected package:

```md
---
"gitbook": patch
---

Provide a short description of the change.
```

Save as `.changeset/<name>.md`, then commit it separately with message: `changeset`

## Formatting

Linting uses Oxlint and formatting uses Oxfmt. Always run `bun run format` before committing.

## Comments

Comment to explain *why*, not *what* — the code already shows what it does. Keep comments short, ideally a single line. Avoid multi-line block comments that narrate mechanics a reader can follow from the code; they add noise and go stale. Reserve longer comments for genuinely non-obvious rationale: a subtle invariant, or a workaround and the reason it exists.
