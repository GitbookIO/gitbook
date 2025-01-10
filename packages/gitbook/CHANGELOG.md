# gitbook

## 0.6.0

### Minor Changes

-   98245e5: Adapt code to pull token from customer backend generated custom cookies
-   af3c6a9: Reintroduce a safety check around search whilst we continue investigating caching.
-   08acea6: Investigate an issue causing caches to return empty objects instead of null/undefined.
-   1138d59: Add support for sidebar background styles
-   e86e51f: Fix an issue where the redirects of potentially malicious images were not going through.
-   c71d159: Track events for site insights using the new dedicated API.
-   eb7c22f: Revert scalar to 1.0.87 to mitigate an issue with ApiClientModalProvider
-   ea1468c: Send redirectOnError param to getPublishedContent when token is pulled from cookie
-   7ee9158: Restyle PageAside to use sidebar list styles
-   1417279: Track clicks on links (header, footer, content) for site insights.
-   8126a83: Improve readability of tables with hover style and vertical dividers
-   db74ea3: Image optimization endpoint redirects to underlying image URL if the signature is not the latest.
-   99579ac: Fix a vulnerability issue for images using an older version of the image signing parameter.
-   e4e2f52: Track an event into site insights when visitor is opening the Scalar API client.

### Patch Changes

-   d876399: Fix UI search without ask AI enabled and fix error with questions not returned from API
-   c30bc24: Fix empty sitemap
-   6059efe: Fix search no results error showing while there are results
-   c77142a: Log component stack in Sentry
-   32aa1f9: Handle security issue with cookies on Safari
-   c1e27cc: Fix pass Sentry release properly
-   5ae1b88: Fix shrinking page icons
-   665b6be: Ignore invalid API calls to `getSiteRedirectFromSource` API

    To reduce the load on the API and also avoid errors.

-   d66c184: Ignore errors from event flushing
-   6088fa5: Simplify search results logic to investigate a bug
-   09c7c30: Try to fix error on og image generation
-   ae99f87: Improve emoji setup, align with GitBook app
-   ecfdb97: Fix multiple bugs due to headers read in an anarchic way in the app.
-   3a7210d: Fix zoom image view transition on Safari
-   718a8a5: Position the variant picker in the ToC
-   8276ba0: Make cookies access safer
-   56c52e0: Handle Firefox security error on localStorage
-   8af1abc: Improve contrast of search box placeholder
-   82dc9c4: Simplify the `useHash` algo used.
-   48ab59f: Improve colour contrast of list item decoration
-   d2bc567: Set Sentry release
-   37d13d8: Avoid error on fetch by passing a string URL
-   46f63cb: Fix code format overriding inline link styles
-   5950657: Fix emojis display
-   5c87ec7: Implement a safer way to interact with localStorage.

    If it's disabled on the browser it should not throw error.

-   02d876e: Fix search UI behaviour
-   f4a90de: Fix two issues where pages would crash due Recoil not behaving correctly in RSC.
-   cbe6139: Fix dynamic tabs infinite loop
-   0b6ddca: Fix variant selector contrast for non-default themes
-   fde32e2: Force route handler to be dynamic to avoid errors
-   300f7bf: Fix search loading state
-   1c97536: Fix Sentry instrumentation
-   b0bd871: Even safer localStorage
-   b950a64: Avoid errors on legacy browsers
-   6691492: Fix viewing PDF from space
-   e8e64bf: Fix bullet list display on full size blocks
-   16194c5: Vertical orientation for sections list on sites without header
-   5dab70f: Fix "Parser" language syntax highlighting
-   deb8c54: Upgrade Next.js to v15, upgrade Shiki and use JS RegExp engine
-   a6f6591: Fix server actions cache compromised. Leading to some bugs on frontend.
-   44a20fe: Improve smoothness of scroll listener
-   6b50360: Fix view transition error on Safari
-   741dd49: Bump `heading-3` font size to offset it from paragraphs
-   5112e3e: Fix Sentry instrumentation server-side
-   Updated dependencies [e4e2f52]
-   Updated dependencies [eb7c22f]
-   Updated dependencies [ea1468c]
-   Updated dependencies [648f0e9]
-   Updated dependencies [f92e906]
-   Updated dependencies [fc7b16f]
    -   @gitbook/react-openapi@0.8.0
    -   @gitbook/react-contentkit@0.6.0

## 0.5.0

### Minor Changes

-   57cdd25: GitBook Open now supports Ask AI in sites. When asking a question to Ask AI, GitBook will use context from across your site sections and variants to provide the best answer.
-   ca134c8: Fix an issue where the active site section indicator appeared above any dropdowns.
-   d48926e: Fix an issue where the space dropdown was shown under the site sections in Safari.
-   9fe8142: Fix an issue where Ask AI was erroring due to an object being passed as a param.
-   d843e5e: Fix an issue where the space dropdown could appear behind the header.
-   a2e5647: Fix the styling of site section tabs on smaller screens.

### Patch Changes

-   076dc48: Fix expandable block anchore resolution
-   d9bb9f9: Fix an issue with the cookie banner buttons being non responsive
-   23584c9: Update the site header with new styling, a new search button, and refactored layout
-   664debc: Add support for tint color
-   4d56f11: Update styling of search+ask modal
-   061c0c1: Fix a regression in variant drop-down caused by missing z-index.
-   2f76712: Add breadcrumbs above page title
-   07cf835: Add scroll margin to the top when there are sections
-   5d72b35: Smoother tab transition for sections
-   7c71363: Don't adjust fallback font for mono font.
-   7675c2c: Optimize performances by using new API endpoint for fetching site data.
-   87eea73: Fix margin and image resolution of header logo
-   aa2ed0f: Restyle hint blocks
-   ffd3937: Fix security issue with image resizing that could be used for phishing
-   2ce59d7: Fix - whitespace added to site section tabs with icons.
-   c73e07d: Increase token max length to fix code not highlighted
-   3b3d6e2: Add icons to sections
-   1ed18c0: style: adds missing scalar css variables
-   Updated dependencies [b7a5106]
-   Updated dependencies [4771c78]
-   Updated dependencies [ff50ac2]
-   Updated dependencies [867481c]
-   Updated dependencies [7ba67fd]
-   Updated dependencies [a78c1ec]
    -   @gitbook/cache-do@0.1.1
    -   @gitbook/react-openapi@0.7.1

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
