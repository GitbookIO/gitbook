# gitbook

## 0.4.0

### Minor Changes

-   e09f747: Revalidate change request cached content when pressing refresh button
-   2fa0851: Add navigation tabs for sections
-   a4b63b8: Support resolution of new site URLs with sections
-   5c35f36: Replace all icons, previously imported from Geist, by new package `@gitbook/icons`
-   e9b31a5: Unify section tab styles with page item styles
-   f12a215: Add support for Norwegian language
-   f4c9536: Optimize layout shift while transitioning between pages with full width blocks (ex: OpenAPI blocks)
-   1f24fe4: Add support for page icons
-   cda08a9: Add support for searching results in a sections site
-   b32e40c: Persist state of tabs and dynamically sync them based on title
-   15d2ee3: Show the caption for file blocks
-   f885e88: Improve the toolbar for change-requests and revisions to show more actions
-   07ea45b: Remove deprecated synced block from GitBook Open
-   c3675fd: Added support for new Reusable Content block.
-   1f24fe4: Add support for icons style customization for sites
-   4c19014: Prevent search indexation for pages where it's configured as disabled
-   3422ad4: Update rendering of community ads to match new API response, and make it possible to preview ads.
-   1152445: Changed the alternative URL resolution criteria in order to support site URLs without /v/ prefix
-   2c437f7: Fix linking to a tab itself

### Patch Changes

-   aa32198: Avoid multiple <h1> in the page by using a <div> for the title in the header
-   51fa3ab: Adds content-visibility css property to OpenAPI Operation for better render performance
-   a7066cc: Fix scroll position when navigating pages on mobile
-   c754fc9: Add automatic color contrast in site header, restyle search button
-   5fe7adb: RND-3532: drop down menu for hidden links at small screen size
-   6295881: Change dark mode shadow for multi-space search toolbar
-   f89b31c: Upgrade the scalar api client package
-   13c7534: Use ellipsis and fix icon color for more links in the header on small screen
-   f885e88: Improve consistency of change request preview by removing cache-control on response
-   16e6171: Improve performances of loading pages with embeds by caching them
-   34d36c6: Fix GitBook specific static assets not being served correctly when deployed on Cloudflare
-   af9e66e: Only display spaces dropdown in compact header when site is multi-variants
-   e3a3d6a: Improve perception of fast loading by not rendering skeletons for individual blocks in the top part of the viewport
-   042b850: Automatically scroll to active item in TOC
-   d43202f: Optimize bundle size of the server output by reducing bundle size of shiki (skipping themes)
-   bfbed1a: Ensure "Sponsored via GitBook" can be translated in all languages
-   fe9e6c1: Update ogimage with new design
-   17f71ba: Use url hash to open Expandable and scroll to anchor
-   3c07e65: Fix margin for paragraphs in quote blocks
-   636b868: Use new cache backend, powered by Durable Objects, alongside the existing ones (KV, etc).
-   f16560c: Include offset in calculations of whether scrollable element is in view
-   689f553: Fix inconsistent click area in table because of scroll indicator
-   6ce3cea: Stop using KV cache backend for now, but also improves it for higher performances
-   e914903: Synchronize response and response example tabs
-   0f990c7: Show definition title when visible in cards
-   e3a3d6a: Fix flickering when displaying an "Ask" answer with code blocks
-   4cbcc5b: Rollback of scalar modal while fixing perf issue
-   3996110: Optimize images rendered in community ads
-   133c3e7: Update design of Checkbox to be more consistent and readable
-   5096f7f: Disable KV cache for docs.gitbook.com as a test, also disable it for change-request to improve consistency
-   0f1565c: Add optional env `GITBOOK_INTEGRATIONS_HOST` to configure the host serving the integrations
-   2ff7ed1: Fix table of contents being visible on mobile when disabled at the page level
-   b075f0f: Fix accessibility of the table of contents by using `aria-current` instead of `aria-selected`
-   cb782a7: Fix "ip" being passed to BSA for community ads
-   a7af3ca: Improving the look and feel of new section tabs
-   0bf985a: Don't show hidden pages in the empty state of a page
-   d6c28a0: Update header styling of sections, variant selector, and button links

    -   Change position of variant selector depending on context (next to logo or in table of contents)
    -   Update section tab styling and animation
    -   Make header buttons smaller with a new `medium` button size

-   Updated dependencies [51fa3ab]
-   Updated dependencies [9b8d519]
-   Updated dependencies [cf3045a]
-   Updated dependencies [f89b31c]
-   Updated dependencies [d0f4860]
-   Updated dependencies [ef9d012]
-   Updated dependencies [094e9cd]
-   Updated dependencies [636b868]
-   Updated dependencies [56f5fa1]
-   Updated dependencies [5c35f36]
-   Updated dependencies [4247361]
-   Updated dependencies [aa8c49e]
-   Updated dependencies [e914903]
-   Updated dependencies [4cbcc5b]
-   Updated dependencies [0f1565c]
-   Updated dependencies [237b703]
-   Updated dependencies [51955da]
-   Updated dependencies [a679e72]
-   Updated dependencies [c079c3c]
-   Updated dependencies [5c35f36]
-   Updated dependencies [776bc31]
    -   @gitbook/react-openapi@0.7.0
    -   @gitbook/cache-do@0.1.0
    -   @gitbook/icons@0.1.0
    -   @gitbook/react-contentkit@0.5.1
    -   @gitbook/react-math@0.6.0

## 0.3.0

### Minor Changes

-   24b785c: Update shiki for code block syntax highlighting, with support for more languages and fixes for diffs. It also patches the deployment on Cloudflare to support edge functions larger than 4MB.

### Patch Changes

-   acc3f2f: Fix error with the "Try it" of OpenAPI block because of the Scalar proxy failing on Cloudflare with the `cache` option
-   Updated dependencies [709f1a1]
-   Updated dependencies [ede2335]
-   Updated dependencies [0426312]
    -   @gitbook/react-openapi@0.6.0

## 0.2.2

### Patch Changes

-   Updated dependencies [3445db4]
    -   @gitbook/react-contentkit@0.5.0
    -   @gitbook/react-openapi@0.5.0
    -   @gitbook/react-math@0.5.0

## 0.2.1

### Patch Changes

-   Updated dependencies [24cd72e]
    -   @gitbook/react-contentkit@0.4.0
    -   @gitbook/react-math@0.4.0
    -   @gitbook/react-openapi@0.4.0

## 0.2.0

### Minor Changes

-   de747b7: Refactor the repository to be a proper monorepo and publish JS files on NPM instead of TypeScript files.

### Patch Changes

-   Updated dependencies [de747b7]
-   Updated dependencies [de747b7]
    -   @gitbook/react-contentkit@0.3.0
    -   @gitbook/react-openapi@0.3.0
    -   @gitbook/react-math@0.3.0
