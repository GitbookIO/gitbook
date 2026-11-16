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

## Bumping Next.js or OpenNext

Type checks and unit tests miss runtime regressions: OpenNext 4.1.15 changed the composable cache key format, and every `'use cache'` call silently missed for days. Before committing a bump of `next`, `@opennextjs/aws` or `@opennextjs/cloudflare`, run both runtimes locally from `packages/gitbook`:

1. **Next**: `bun run build:local && bun run start`, then load several distinct pages under `http://localhost:3000/url/gitbook.com/docs`.
2. **OpenNext**: `bun run build:cloudflare`, delete `openNext/customWorkers/.wrangler` (stale cache hits otherwise skip the server), then run `bun run dev:cf:server` and `bun run dev:cf:middleware` and load several distinct pages under `http://127.0.0.1:8771/url/gitbook.com/docs`.
3. Diff the changed OpenNext versions' adapters that call our overrides in `openNext/` (incremental, composable and tag cache, queue), e.g. with `npm pack` of the old and new versions.

The bump is safe when every page returns 200 on both runtimes and the server logs show no cache errors (grep `Failed to` and `regional cache`). Report the pages checked and the log result in the PR.

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
