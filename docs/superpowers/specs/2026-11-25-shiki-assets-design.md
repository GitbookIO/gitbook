# Load Shiki languages and themes from static assets

## Why

`highlight.ts` imports `bundledLanguages` / `bundledThemes`, so ~670 language modules (9.7 MB) and the
themes (1.7 MB) are emitted as lazy chunks in every build: the Cloudflare server worker (counts against
the upload size limit and startup), the Vercel function and the client bundle (`ClientCodeBlock` imports
`./highlight`). Goal: improve all three by moving grammars and themes out of the JS bundles into static
JSON loaded on demand.

## Goals / non-goals

- Goal: no Shiki grammar or bundled theme in any JS bundle; identical highlighting output.
- Goal: measurable before/after on worker upload size, Vercel function size, client chunks, and
  server memory on a cold render.
- Non-goal: changing highlighting behaviour, themes, or the custom themes (`customThemes.ts` stays in code).
- Anti-goal: rendering depending on an external network hop on the server.

## Approaches

- **A. Per-runtime reader (picked).** Cloudflare reads via an `ASSETS` binding on the server worker,
  Vercel reads files traced into the function with `fs`, the browser fetches the CDN URL.
  No server network hop; one small helper with three branches.
- B. HTTP fetch everywhere via `getAssetURL()`. Single code path, but every cold isolate does a network
  round trip per language and rendering depends on the assets host (preview/local builds included).
- C. A, but keep bundled imports on Vercel. Less change, leaves Vercel untouched — rejected since all
  three targets should improve.

## Design

1. **Generate step** — `scripts/generate-shiki-assets.ts`, added to `generate:assets` (and the `clean`
   script). For every entry of `bundledLanguages` / `bundledThemes`, import the module and write its
   default export as JSON to `public/~gitbook/static/shiki/<shiki version>/{langs,themes}/<name>.json`.
   Language modules already export a flat array including their embedded languages, so each file is
   self-contained: one fetch per language. The versioned path keeps URLs immutable, like the Mermaid
   runtime. Also emit a small generated TS module with the language names, aliases and theme names so
   `getLanguageForSyntax` and theme validation keep working without importing grammars.
2. **Loader** — `loadShikiAsset(kind, name)`:
   - `GITBOOK_RUNTIME === 'cloudflare'`: `getCloudflareContext().env.ASSETS.fetch(...)`; add the
     `assets` binding to `openNext/customWorkers/defaultWrangler.jsonc` (and `wrangler.jsonc` if the
     single-worker setup still deploys).
   - Node (Vercel, `next start`, dev): `fs.readFile` from the traced `public/~gitbook/static/shiki`
     directory; add it to `outputFileTracingIncludes` in `next.config.mjs`.
   - Browser: `fetch(getAssetURL(...))`.
   Each asset is loaded at most once per isolate (memoised promise, cleared on failure).
3. **Highlighter** — replace `createdBundledHighlighter` with a core highlighter
   (`createHighlighterCore` + JS regex engine) that `loadLanguage` / `loadTheme`s what a block needs
   before tokenising; custom themes are loaded from code. `highlight` and `preloadHighlight` keep their
   signatures. If loading fails, log it and fall back to `plainHighlight`.
4. **Verification** — existing `highlight.test.ts` passes unchanged; check that no `@shikijs/langs`
   chunk remains in `.next` / `.open-next` output; compare sizes and cold-render memory before/after
   (see the OpenNext memory profiling notes); render a page with code blocks on `next start` and on the
   split Cloudflare workers.

Not customer-visible: highlighted output is unchanged, so no comms decision is needed.

## Left to the builder

- Exact location of the traced files on Vercel (`process.cwd()` vs a path relative to the module).
- Whether the deployed Cloudflare config is generated elsewhere and also needs the binding.
- The unit-test path for the loader (`fs` branch is what `bun test` exercises).
