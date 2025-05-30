# gitbook-v2

## 0.3.1

### Patch Changes

- af66ff7: add a force-revalidate api route to force bust the cache in case of errors
- ba0094a: fix ISR on preview env
- fa3eb07: cache fonts and static image used in OGImage in memory
- 4b67fe5: Add `urlObject.hash` to `linker.toLinkForContent` to pass through URL fragment identifiers, used in search
- 2932077: remove trailing slash from linker

## 0.3.0

### Minor Changes

- 3119066: Add support for reusable content across spaces.
- 7d7806d: Pass SVG images through image resizing without resizing them to serve them from optimal host.

### Patch Changes

- 1c8d9fe: keep data cache in OpenNext between deployment
- 778624a: Only resize images with supported extensions.
- e6ddc0f: Fix URL in sitemap
- 5e975ab: Fix code highlighting for HTTP
- e15757d: Fix crash on Cloudflare by using latest stable version of Next.js instead of canary
- 634e0b4: Improve error messages around undefined site sections.
- 97b7c79: Increase logging around caching behaviour causing page crashes.
- 3f29206: Update the regex for validating site redirect
- dd043df: Revert investigation work around URL caches.

## 0.2.5

### Patch Changes

- Updated dependencies [77397ca]
  - @gitbook/cache-tags@0.3.1

## 0.2.4

### Patch Changes

- 4234289: Fix incoming URL for requests that were proxied
- Updated dependencies [116575c]
  - @gitbook/cache-tags@0.3.0

## 0.2.3

### Patch Changes

- 5b2bf82: Use stable site URL data for route rewrite in the middleware

## 0.2.2

### Patch Changes

- 54ee014: Add initial support for loading custom fonts
- bba2e52: Fix site redirects when it includes a section/variant path

## 0.2.1

### Patch Changes

- Updated dependencies [f32bf1f]
  - @gitbook/cache-tags@0.2.0

## 0.2.0

### Minor Changes

- 76c7974: Add route to revalidate cached data

## 0.1.2

### Patch Changes

- 05ffd0e: Improving data cache management for computed content
- Updated dependencies [05ffd0e]
  - @gitbook/cache-tags@0.1.0

## 0.1.1

### Patch Changes

- 3e11678: fix: lost section groups

## 0.1.0

### Minor Changes

- cfccc44: Setup structure and deployment for new version
