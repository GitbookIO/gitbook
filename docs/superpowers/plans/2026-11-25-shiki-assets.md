# Shiki Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve Shiki grammars and bundled themes as static JSON loaded on demand instead of bundling them into the Cloudflare worker, the Vercel function and the client.

**Architecture:** A generate script writes every Shiki language and theme as JSON under `public/~gitbook/static/shiki/<version>/`, plus a committed name catalog. The highlighting logic moves into a factory that takes an asset loader; the server entry binds a loader that reads via the Cloudflare `ASSETS` binding or `fs`, the client entry binds a `fetch` loader. Every step is measured against a recorded baseline.

**Tech Stack:** Next.js (webpack), OpenNext Cloudflare / wrangler, Shiki 3.21 (`shiki/core`, JS regex engine), Bun test.

**Spec:** `docs/superpowers/specs/2026-11-25-shiki-assets-design.md`

## Global Constraints

- All paths below are relative to `packages/gitbook` unless they start with `docs/` or `.changeset/`.
- Highlighted output must be identical: `highlight.test.ts` passes without edits.
- No module under `shiki/langs`, `shiki/themes`, `@shikijs/langs` or `@shikijs/themes` may be imported by app code after Task 4 (the generate script may).
- Engine stays `createJavaScriptRegexEngine({ forgiving: true, target: 'ES2018' })`.
- Asset URL path: `shiki/<shiki version>/langs/<id>.json` and `shiki/<shiki version>/themes/<id>.json`, relative to `~gitbook/static` (served immutable by the existing `/~gitbook/static/:path*` header rule).
- Server rendering must never do a network hop to read these assets.
- Comments explain why, one line where possible (AGENTS.md). Run `bun run format` before every commit.
- Bun tests run as `bun test <file> --preload ./tests/preload-bun.ts`.
- Every task that changes bundling ends by appending a column to `docs/superpowers/plans/2026-11-25-shiki-assets-measurements.md`.

## Review Focus

1. Many concurrent renders of the same language on a cold instance → the asset is read and registered once, no error. Test in Task 2.
2. An asset that fails to load (missing file, ASSETS 404) → that block renders plain, the error is logged, a later render retries. Test in Task 2.
3. Aliases and casing (`js`, `JSON`, `objectivec`, `parser`) → same language as before the change. Test in Task 1.
4. Languages that embed others (`vue`, `markdown` with fences, `html` with `<script>`) → embedded parts highlighted. Test in Task 2.
5. Client-side highlighting (blocks with expressions, large blocks) with `GITBOOK_ASSETS_URL` on another origin → loads via CORS (`Access-Control-Allow-Origin: *` already set). Manual check in Task 4.

---

### Task 0: Worktree setup, measurement script and baseline

**Files:**
- Create: `scripts/measure-shiki-bundles.ts`
- Create: `docs/superpowers/plans/2026-11-25-shiki-assets-measurements.md`

**Interfaces:**
- Produces: `bun scripts/measure-shiki-bundles.ts next|cloudflare` printing one JSON object (fields below) used by every later task.

- [ ] **Step 1: Prepare the worktree** (fresh worktree, deps are missing)

Run from repo root: `bun install && bunx turbo run build --filter='gitbook^...'`, then in `packages/gitbook`: `bun run generate`.
Expected: `public/~gitbook/static/{icons,math,mermaid,scalar,fonts}` exist and `worker-configuration.d.ts` exists.

- [ ] **Step 2: Write `scripts/measure-shiki-bundles.ts`**

Mode `next` (after `bun run build:local`) prints:
- `clientChunksBytes`, `clientChunksCount`: all files in `.next/static/chunks/**/*.js`.
- `clientGrammarChunksBytes`, `clientGrammarChunksCount`: those chunks whose content contains `"scopeName"` (present in every grammar).
- `serverBytes`: total size of `.next/server`; `serverGrammarBytes`: `.next/server/**/*.js` files containing `"scopeName"`.

Mode `cloudflare` (after `bun run build:cloudflare`) prints:
- `handlerBytes`, `handlerGzipBytes` for `.open-next/server-functions/default/packages/gitbook/handler.mjs` (gzip with `Bun.gzipSync`).
- `shikiBytes`: sum of `bytesInOutput` in `handler.mjs.meta.json` for inputs whose path contains `@shikijs/langs` or `@shikijs/themes` (reuse the logic in `scripts/profile-opennext-memory.ts` `getBundleMetrics`).
- `uploadKiB`, `uploadGzipKiB`: parsed from `bunx wrangler deploy --dry-run --config openNext/customWorkers/defaultWrangler.jsonc --env dev` ("Total Upload: X KiB / gzip: Y KiB").

- [ ] **Step 3: Record the baseline**

Run, on the unmodified code:
1. `bun run build:local && bun scripts/measure-shiki-bundles.ts next`
2. Cold render cost on Node: `bun run start`, then the first request to a code-heavy page with several languages (pick one under `http://localhost:3000/url/gitbook.com/docs` with ≥3 languages; note its URL in the measurements file). Measure `curl -o /dev/null -w '%{time_total}'` for the first request after a fresh `start`, 3 fresh starts, report the median. Kill the server by port afterwards.
3. `bun run build:cloudflare && bun scripts/measure-shiki-bundles.ts cloudflare`
4. Server worker memory: follow the OpenNext profiling caveats (delete `openNext/customWorkers/.wrangler` first, `PROFILE_FORCE_GC=true`, request distinct pages including the code-heavy page) with `bun run profile:cf:memory`; record cold and after-load heap of the server worker and its `shikiLanguageBytes`.

Write these into the measurements file as a table: one row per metric, a `Baseline` column, empty columns `Task 2`, `Task 3`, `Task 4`.

- [ ] **Step 4: Commit**

```bash
git add scripts/measure-shiki-bundles.ts docs/superpowers
git commit -m "Add Shiki assets design, plan, measurement script and baseline"
```

---

### Task 1: Generate Shiki assets and the name catalog

**Files:**
- Create: `scripts/generate-shiki-assets.ts`
- Create: `src/components/DocumentView/CodeBlock/shiki-catalog.ts` (generated, committed)
- Create: `src/components/DocumentView/CodeBlock/shiki-catalog.test.ts`
- Modify: `package.json` (`generate:assets`, `clean`)
- Modify: `src/components/DocumentView/CodeBlock/plain-highlight.ts` (drop `shiki/themes`)
- Modify: `src/components/DocumentView/CodeBlock/highlight.ts` (language resolution uses the catalog)

**Interfaces:**
- Produces (in `shiki-catalog.ts`):
  - `SHIKI_ASSETS_PATH: string` = `` `shiki/${version}` ``
  - `SHIKI_LANGUAGES: Record<string, string>`: every id and alias (lowercase) → canonical id.
  - `SHIKI_THEMES: Record<string, { type: 'light' | 'dark' }>`: bundled theme id → type.
  - `getShikiLanguageAssetPath(id: string): string` → `` `${SHIKI_ASSETS_PATH}/langs/${id}.json` ``
  - `getShikiThemeAssetPath(id: string): string` → `` `${SHIKI_ASSETS_PATH}/themes/${id}.json` ``
- Produces (in `highlight.ts`): `getLanguageForSyntax(syntax: string): string | null` now returns a canonical id (exported for tests).

- [ ] **Step 1: Write the failing tests** in `shiki-catalog.test.ts`

```ts
it('maps ids and aliases to canonical ids', () => {
    expect(SHIKI_LANGUAGES.javascript).toBe('javascript');
    expect(SHIKI_LANGUAGES.js).toBe('javascript');
    expect(SHIKI_LANGUAGES['objective-c']).toBe('objective-c');
});
it('writes one self-contained JSON file per language', async () => {
    const vue = await Bun.file(`public/~gitbook/static/${getShikiLanguageAssetPath('vue')}`).json();
    expect(vue.map((l: { name: string }) => l.name)).toEqual(expect.arrayContaining(['vue', 'html', 'css', 'javascript']));
});
it('writes every bundled theme', async () => {
    expect(SHIKI_THEMES['github-dark'].type).toBe('dark');
    expect(await Bun.file(`public/~gitbook/static/${getShikiThemeAssetPath('github-dark')}`).exists()).toBe(true);
});
it('resolves GitBook syntaxes', () => {
    expect(getLanguageForSyntax('JSON')).toBe('json');
    expect(getLanguageForSyntax('js')).toBe('javascript');
    expect(getLanguageForSyntax('objectivec')).toBe('objective-c');
    expect(getLanguageForSyntax('parser')).toBe('blade');
    expect(getLanguageForSyntax('not-a-language')).toBeNull();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test src/components/DocumentView/CodeBlock/shiki-catalog.test.ts --preload ./tests/preload-bun.ts`
Expected: FAIL, `shiki-catalog` not found.

- [ ] **Step 3: Implement `scripts/generate-shiki-assets.ts`**

Iterate `bundledLanguagesInfo` / `bundledThemesInfo` from `shiki/langs` / `shiki/themes`; for each, `(await info.import()).default` and write `JSON.stringify` of it to `public/~gitbook/static/<path>` (language default exports are already flat arrays including embedded languages). Remove `public/~gitbook/static/shiki` first. Version from `require('shiki/package.json')`. Write `shiki-catalog.ts` (header comment: generated by the script, do not edit). Add `bun ./scripts/generate-shiki-assets.ts` to `generate:assets` and `rm -rf ./public/~gitbook/static/shiki` to `clean`.

- [ ] **Step 4: Switch `plain-highlight.ts` to `SHIKI_THEMES` and `highlight.ts`'s `getLanguageForSyntax` to `SHIKI_LANGUAGES`** (keep `syntaxAliases`; `highlight.ts` still uses the bundled highlighter in this task, keyed by the canonical id).

- [ ] **Step 5: Run the new and existing tests**

Run: `bun run generate:assets && bun test src/components/DocumentView/CodeBlock --preload ./tests/preload-bun.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
bun run format
git add scripts/generate-shiki-assets.ts src/components/DocumentView/CodeBlock package.json
git commit -m "Generate Shiki languages and themes as static JSON assets"
```

---

### Task 2: Highlighter factory and the Node (fs) loader

**Files:**
- Create: `src/components/DocumentView/CodeBlock/highlighter.ts` (factory: all logic now in `highlight.ts`)
- Create: `src/components/DocumentView/CodeBlock/shiki-assets.server.ts` (server loader)
- Create: `src/components/DocumentView/CodeBlock/highlighter.test.ts`
- Modify: `src/components/DocumentView/CodeBlock/highlight.ts` (server entry: binds the server loader)
- Modify: `next.config.mjs` (`outputFileTracingIncludes`)

**Interfaces:**
- Consumes: Task 1 catalog.
- Produces:
  - `type ShikiAssetLoader = (path: string) => Promise<unknown>` (path relative to `~gitbook/static`).
  - `createHighlight(loadAsset: ShikiAssetLoader): { highlight: typeof highlight; preloadHighlight: typeof preloadHighlight }` in `highlighter.ts`; signatures of `highlight` / `preloadHighlight` unchanged.
  - `loadShikiAssetOnServer: ShikiAssetLoader` in `shiki-assets.server.ts`.
  - `highlight.ts` keeps exporting `highlight`, `preloadHighlight`, `getLanguageForSyntax` and `export * from './highlight-tokens'`.

- [ ] **Step 1: Write the failing tests** in `highlighter.test.ts`, using a fake loader that reads from `public/~gitbook/static` and counts calls per path

```ts
it('loads each asset once under concurrency', async () => {
    const { highlight } = createHighlight(countingLoader);
    await Promise.all(Array.from({ length: 10 }, () => highlight(jsBlock, [])));
    expect(calls.get(getShikiLanguageAssetPath('javascript'))).toBe(1);
});
it('falls back to plain highlighting and retries after a failure', async () => {
    const { highlight } = createHighlight(failOnceLoader);
    const first = await highlight(jsBlock, []);
    expect(first.lines[0].tokens.every((t) => t.type !== 'shiki')).toBe(true); // plain
    const second = await highlight(jsBlock, []);
    expect(second.lines[0].tokens.some((t) => t.type === 'shiki')).toBe(true);
});
it('highlights embedded languages', async () => {
    const { highlight } = createHighlight(countingLoader);
    const result = await highlight(vueBlockWithScript, []);
    // the `const` inside <script> gets a keyword colour distinct from plain text
    expect(colorOf(result, 'const')).not.toBe(result.fg);
});
it('loads custom themes from code, not from assets', async () => {
    const { highlight } = createHighlight(countingLoader);
    await highlight(jsBlock, [], { themes: { light: 'default-light', dark: 'github-dark' } });
    expect([...calls.keys()].some((p) => p.includes('default-light'))).toBe(false);
});
```

Adjust the token-shape assertions to the real `HighlightToken` type in `highlight-tokens.ts`; the intent of each test is fixed.

- [ ] **Step 2: Run to verify they fail**

Run: `bun test src/components/DocumentView/CodeBlock/highlighter.test.ts --preload ./tests/preload-bun.ts`
Expected: FAIL, `createHighlight` not found.

- [ ] **Step 3: Implement `createHighlight` in `highlighter.ts`**

Move the body of `highlight.ts` here. One `createHighlighterCore({ themes: [], langs: [], engine })` promise per factory call. A `Map<string, Promise<void>>` of load-and-register promises keyed by asset path (custom themes keyed by name, registered with `loadTheme(customThemes[name])`); delete the entry on rejection so later renders retry. `highlight` awaits the language and both themes; on any load error, `console.error` and return `plainHighlight(...)`.

- [ ] **Step 4: Implement `loadShikiAssetOnServer`** (Node branch only in this task)

`JSON.parse(await readFile(join(process.cwd(), 'public/~gitbook/static', path), 'utf8'))`. `highlight.ts` becomes `export const { highlight, preloadHighlight } = createHighlight(loadShikiAssetOnServer)` plus its re-exports. `ClientCodeBlock` still imports `./highlight` in this task.

- [ ] **Step 5: Add tracing** in `next.config.mjs`: `outputFileTracingIncludes: { '/**': ['./public/~gitbook/static/shiki/**/*'] }` with a one-line why comment.

- [ ] **Step 6: Run all CodeBlock tests**

Run: `bun test src/components/DocumentView/CodeBlock --preload ./tests/preload-bun.ts`
Expected: all PASS, including the unmodified `highlight.test.ts`.

- [ ] **Step 7: Verify the Node build and measure**

Run: `bun run build:local && bun scripts/measure-shiki-bundles.ts next`. Expected: `serverGrammarBytes` near 0. Check `.next/server/**/*.nft.json` of the page route lists `public/~gitbook/static/shiki` files. Repeat the cold render measurement (Task 0 Step 3.2) and confirm the code-heavy page renders with colours. Fill the `Task 2` column.

- [ ] **Step 8: Commit**

```bash
bun run format
git add src/components/DocumentView/CodeBlock next.config.mjs docs/superpowers/plans/2026-11-25-shiki-assets-measurements.md
git commit -m "Load Shiki grammars and themes from assets on the server"
```

---

### Task 3: Cloudflare loader through the ASSETS binding

**Files:**
- Modify: `src/components/DocumentView/CodeBlock/shiki-assets.server.ts`
- Modify: `openNext/customWorkers/defaultWrangler.jsonc` (add `"assets": { "directory": "../../.open-next/assets", "binding": "ASSETS" }`, as in `middlewareWrangler.jsonc`)

**Interfaces:**
- Consumes: `getCloudflareContext()` from `src/lib/data/cloudflare.ts` (returns null off Cloudflare).

- [ ] **Step 1: Add the Cloudflare branch**: when `getCloudflareContext()` is non-null, `env.ASSETS.fetch(new URL(`/~gitbook/static/${path}`, 'https://assets.local'))`, throw on non-OK, return `response.json()`. Regenerate types with `wrangler types` if `ASSETS` is missing from the env type.

- [ ] **Step 2: Check whether the deployed server worker config is generated elsewhere** (`grep -rn "defaultWrangler\|gitbook-open-v2-server" ../../.github ../../scripts packages/gitbook/openNext`) and add the binding there too if so. Note the finding in the commit message.

- [ ] **Step 3: Verify on the split workers and measure**

Run: `bun run build:cloudflare && bun scripts/measure-shiki-bundles.ts cloudflare`. Expected: `shikiBytes` near 0, `uploadKiB` down by roughly the grammar size. Delete `openNext/customWorkers/.wrangler`, run `bun run dev:cf:server` and `bun run dev:cf:middleware`, load the code-heavy page at `http://127.0.0.1:8771/url/gitbook.com/docs/...`: colours present, server log has no `Failed to` / asset errors. Re-run the memory profile (Task 0 Step 3.4). Fill the `Task 3` column.

- [ ] **Step 4: Commit**

```bash
bun run format
git add src/components/DocumentView/CodeBlock openNext/customWorkers/defaultWrangler.jsonc docs/superpowers/plans/2026-11-25-shiki-assets-measurements.md
git commit -m "Read Shiki assets through the ASSETS binding on Cloudflare"
```

---

### Task 4: Client loader

**Files:**
- Create: `src/components/DocumentView/CodeBlock/highlight-client.ts`
- Modify: `src/components/DocumentView/CodeBlock/ClientCodeBlock.tsx:53,102` (`import('./highlight-client')`)

**Interfaces:**
- Produces: `highlight-client.ts` exports `{ highlight, preloadHighlight } = createHighlight((path) => fetch(getAssetURL(path)).then(...))`, throwing on non-OK. It must not import `shiki-assets.server.ts`, `node:*` or `@opennextjs/cloudflare`.

- [ ] **Step 1: Implement `highlight-client.ts` and switch both dynamic imports in `ClientCodeBlock.tsx`.**

- [ ] **Step 2: Verify no grammar or server code reaches the client, and measure**

Run: `bun run build:local && bun scripts/measure-shiki-bundles.ts next`. Expected: `clientGrammarChunksCount` 0; `grep -l "node:fs\|ASSETS" .next/static/chunks -r` finds nothing from this change. Fill the `Task 4` column (client metrics; re-run the Cloudflare measurement too since client changes don't affect it but the final column should be complete).

- [ ] **Step 3: Manual browser check**: on `bun run start`, open a page with a code block containing an expression or a large block (rendered by `ClientCodeBlock`); confirm it gets highlighted and the Network tab shows `~gitbook/static/shiki/.../langs/<id>.json` requests with `immutable` caching. If a staging-like `GITBOOK_ASSETS_URL` is available, confirm the cross-origin load works.

- [ ] **Step 4: Commit**

```bash
bun run format
git add src/components/DocumentView/CodeBlock docs/superpowers/plans/2026-11-25-shiki-assets-measurements.md
git commit -m "Load Shiki assets over the CDN in the browser"
```

---

### Task 5: Final checks, review and changeset

- [ ] **Step 1:** `bun run lint`, `bun run typecheck`, `bun run unit` (via `test-runner`). Expected: clean.
- [ ] **Step 2:** `grep -rn "shiki/langs\|shiki/themes\|@shikijs/langs\|@shikijs/themes" src` returns only the generate script's consumers (none in `src`).
- [ ] **Step 3:** Run `code-reviewer` on the branch diff against `main`; fix findings or say why they are wrong.
- [ ] **Step 4:** Add a summary row of deltas (baseline → final, absolute and %) to the measurements file and commit it.
- [ ] **Step 5:** Changeset `.changeset/shiki-static-assets.md` (`"gitbook": patch`, "Load Shiki languages and themes from static assets instead of bundling them."), committed separately with message `changeset`.
