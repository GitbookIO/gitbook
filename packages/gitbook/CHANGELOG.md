# gitbook

## 0.8.2

### Patch Changes

- ed07206: Fix OpenAPI path overflow on mobile
- 4dab1c5: Fix alignment of `prominent` search bar on full-width pages
- 6eae764: Support body examples
- 54ee014: Add initial support for loading custom fonts
- d2facb2: Mark properties as optional if not required
- bba2e52: Fix site redirects when it includes a section/variant path
- 4723f03: Restyle section group dropdown
- 24b7808: Fix `prominent` search bar width on `md` screens
- 1fe3286: Fix OpenAPI block overflow issue
- Updated dependencies [48c18c0]
- Updated dependencies [6eae764]
- Updated dependencies [7212973]
- Updated dependencies [d2facb2]
- Updated dependencies [73e2b47]
- Updated dependencies [70be2c6]
- Updated dependencies [fc00b51]
- Updated dependencies [a84b06b]
  - @gitbook/openapi-parser@2.1.1
  - @gitbook/react-openapi@1.1.6

## 0.8.1

### Patch Changes

- 886e204: Update OpenAPI operation path design
- Updated dependencies [886e204]
- Updated dependencies [4f0a772]
  - @gitbook/react-openapi@1.1.5
  - @gitbook/colors@0.3.0

## 0.8.0

### Minor Changes

- eec3eed: Add styling for prominent search bar option

### Patch Changes

- 16292de: Display sidebar on no-TOC pages
- 9b5f971: Transparent background for OpenAPI path block
- 99da8df: Optimize favicons and og:image using the image resizer
- b011ea0: Fix rendering of code blocks in Ask AI when being streamed
- 9bc3d50: Info hint background and link color fixes
- 31d800e: Render OpenAPISchemas block
- Updated dependencies [6aaeae2]
- Updated dependencies [c60e9ba]
- Updated dependencies [9108c56]
- Updated dependencies [31d800e]
- Updated dependencies [ff3b708]
- Updated dependencies [f32bf1f]
- Updated dependencies [c9ea239]
  - @gitbook/react-contentkit@0.7.0
  - @gitbook/react-openapi@1.1.4
  - @gitbook/cache-tags@0.2.0

## 0.7.3

### Patch Changes

- eaf2d68: OpenAPI operation title fallback in sections
- Updated dependencies [844059f]
- Updated dependencies [88f64b0]
  - @gitbook/react-openapi@1.1.3
  - @gitbook/icons@0.2.0
  - @gitbook/react-contentkit@0.6.2

## 0.7.2

### Patch Changes

- f127d28: Rename OpenAPIModels to OpenAPISchemas
- Updated dependencies [f127d28]
  - @gitbook/react-openapi@1.1.2

## 0.7.1

### Patch Changes

- Updated dependencies [f574858]
  - @gitbook/react-openapi@1.1.1

## 0.7.0

### Minor Changes

- bb3ca9c: Implement OpenAPI models blocks

### Patch Changes

- 5907bd9: Adjust hint block spacing
- 9ffc3b6: Fix content overflowing out of its container in tabs
- Updated dependencies [0278a14]
- Updated dependencies [bb3ca9c]
- Updated dependencies [3173d8e]
- Updated dependencies [052e07a]
  - @gitbook/openapi-parser@2.1.0
  - @gitbook/react-openapi@1.1.0

## 0.6.5

### Patch Changes

- 05ffd0e: Improving data cache management for computed content
- 8beb5d6: Add input elements to ContentKit
- Updated dependencies [53f5dbe]
- Updated dependencies [05ffd0e]
- Updated dependencies [8beb5d6]
  - @gitbook/openapi-parser@2.0.2
  - @gitbook/cache-tags@0.1.0
  - @gitbook/react-contentkit@0.6.1
  - @gitbook/react-openapi@1.0.5

## 0.6.4

### Patch Changes

- 9b914d1: Fix getProxyModeBasePath that was computing incorrect base path in some scenarios
- 2ae76f9: Change how a site in proxy mode is resolved
- 027a859: Add support for links style customization option
- 3e11678: fix: lost section groups
- 3319375: Support OpenAPI operation block
- Updated dependencies [722f02e]
- Updated dependencies [0924259]
  - @gitbook/react-openapi@1.0.4
  - @gitbook/openapi-parser@2.0.1

## 0.6.3

### Patch Changes

- a820739: Remove unused search api method from gitbook/api/lib
- a054554: Implement a trusted mode to speed up OpenAPI spec validation
- 66d0fc0: Update design for hint block: use semantic colors (info, warning, danger, success) and add alternative styling for hints with headings
- 9f0de74: Add support for new OpenAPI ref
- da55fac: Render GitBook blocks in OpenAPI operation description
- Updated dependencies [c808bb1]
- Updated dependencies [dc2dbc5]
- Updated dependencies [f1d1d2f]
- Updated dependencies [e24206e]
- Updated dependencies [a054554]
- Updated dependencies [05e1d8c]
- Updated dependencies [b4a12d6]
- Updated dependencies [9f0de74]
- Updated dependencies [da55fac]
  - @gitbook/openapi-parser@2.0.0
  - @gitbook/react-openapi@1.0.3

## 0.6.2

### Patch Changes

- 359bb97: Fix opening external links when the GitBook page is embedded in an iframe
- 6157583: Improve Markdown parsing
- 82cd9f2: Add support for anchor links in OpenAPI blocks
- Updated dependencies [445baaa]
- Updated dependencies [bb5c6a4]
- Updated dependencies [a3f1fea]
- Updated dependencies [6157583]
- Updated dependencies [7419ee7]
- Updated dependencies [82cd9f2]
  - @gitbook/colors@0.2.0
  - @gitbook/react-openapi@1.0.2
  - @gitbook/openapi-parser@1.0.1

## 0.6.1

### Patch Changes

- dddb4ec: Fix long tab group description
- Updated dependencies [f8d4c76]
- Updated dependencies [dddb4ec]
- Updated dependencies [f8d4c76]
  - @gitbook/react-openapi@1.0.1

## 0.6.0

### Minor Changes

- 98245e5: Adapt code to pull token from customer backend generated custom cookies
- af3c6a9: Reintroduce a safety check around search whilst we continue investigating caching.
- 95f2aa4: Track new events for site insights when ads are being clicked
- 08acea6: Investigate an issue causing caches to return empty objects instead of null/undefined.
- 1138d59: Add support for sidebar background styles
- 9e18ae6: Overhaul colour scale & Tailwind colour classes
- e86e51f: Fix an issue where the redirects of potentially malicious images were not going through.
- 7059c2b: Add support for computed content by fetching computed documents for pages.
- c71d159: Track events for site insights using the new dedicated API.
- eb7c22f: Revert scalar to 1.0.87 to mitigate an issue with ApiClientModalProvider
- ea1468c: Send redirectOnError param to getPublishedContent when token is pulled from cookie
- 7ee9158: Restyle PageAside to use sidebar list styles
- dbba50c: Fix an issue where search and Ask AI triggers unnecessary renders when in a Visitor Authenticated site.
- 1417279: Track clicks on links (header, footer, content) for site insights.
- 9eca010: Improve the display of recommended questions by streaming them.
- 160fca1: new OpenAPI blocks design
- 71688a8: Introduction of new themes: Clean, Muted, Bold, and Gradient
- 1823101: Fix internal properties appearing in OpenAPI docs.
- 6a073e1: Add antialiasing for text rendering
- 8126a83: Improve readability of tables with hover style and vertical dividers
- db74ea3: Image optimization endpoint redirects to underlying image URL if the signature is not the latest.
- 99579ac: Fix a vulnerability issue for images using an older version of the image signing parameter.
- e4e2f52: Track an event into site insights when visitor is opening the Scalar API client.

### Patch Changes

- d876399: Fix UI search without ask AI enabled and fix error with questions not returned from API
- c30bc24: Fix empty sitemap
- e90c96f: page outline on the right remains visible when scrolling, move mode toggler to PageAside
- 5b4e710: Support llms.txt
- b6c3870: Add support for keyboard marks
- 6059efe: Fix search no results error showing while there are results
- c77142a: Log component stack in Sentry
- 1de9d1a: Apply antialiasing on any text that are not code inline/blocks to avoid contrast issues
- 32aa1f9: Handle security issue with cookies on Safari
- d935fb1: Don't add extra page scroll when footer is not present
- 53de5b1: Fix site section URL resolution in Ask AI sources
- 24f5249: Fix vertical section overflow color
- 1762f85: Reduce gap between subsequent header buttons
- c1e27cc: Fix pass Sentry release properly
- 5ae1b88: Fix shrinking page icons
- 8f046a9: Start using tint in more places, TOC and PageAside
- 665b6be: Ignore invalid API calls to `getSiteRedirectFromSource` API

  To reduce the load on the API and also avoid errors.

- 26e6401: Remove KV cache backend and only rely on DO as an external cache backend
- 8cfa67c: Fix default outline list styling
- d66c184: Ignore errors from event flushing
- 6088fa5: Simplify search results logic to investigate a bug
- 68287d3: Cache API spec for 24 hours, revalidated every 2 hours
- 09c7c30: Try to fix error on og image generation
- ae99f87: Improve emoji setup, align with GitBook app
- 2906e60: Downgrade to Next.js v14 to fix incompatibilities with next-on-pages causing multiple bugs.
- 3a7210d: Fix zoom image view transition on Safari
- 718a8a5: Position the variant picker in the ToC
- e5dc05e: Update footer styling and allow for more than 4 footer groups
- 8276ba0: Make cookies access safer
- 1b8a456: Fix Image blocks zoomable behaviour
- 56c52e0: Handle Firefox security error on localStorage
- 0510b6f: Add section description to SectionGroupTile
- 1fcc807: Fix errors from customization not found
- 46edde9: Improve the OpenAPI package API
- 8af1abc: Improve contrast of search box placeholder
- 92b7668: Improve header offset
- d9c8d57: Do not dereference before caching OpenAPI spec.
- 94876e3: Fix regression issue with page icons for multi-line titles
- 47971dc: Fix OG image generation for non-latin characters
- 82dc9c4: Simplify the `useHash` algo used.
- 128ad20: Ignore cache invalidation error from local backend
- ff05e20: Improvements to inline images in headings
- cb100d5: Allow only good values for theme query parameter. Avoid having a 500 error when we pass an invalid value.
- d5aaccd: Remove use of deprecatd API createSitesPageFeedback
- 48ab59f: Improve colour contrast of list item decoration
- d2bc567: Set Sentry release
- 37d13d8: Avoid error on fetch by passing a string URL
- d3e573c: Generate sitemap for all sections and spaces
- f7b801b: Add feedback form to page rating control
- d370a3f: Update the routes for changes/revisions in multi-id mode to match the normal mode
- 46f63cb: Fix code format overriding inline link styles
- 5950657: Fix emojis display
- 528a053: Fix server actions stability leading to no results found sometimes on search
- eac1314: Lazy load iframely script to make page more responsive
- ad19060: Cards stand out slighly more on tinted and dark mode sites, and have better support for headings inside them
- 6f54826: New highlight colors
- 5c87ec7: Implement a safer way to interact with localStorage.

  If it's disabled on the browser it should not throw error.

- 02d876e: Fix search UI behaviour
- f4a90de: Fix two issues where pages would crash due Recoil not behaving correctly in RSC.
- 5576906: Fix table of content displaying arrow next to page with only hidden pages
- aaab157: Visual fix for section group in Safari
- cbe6139: Fix dynamic tabs infinite loop
- 65cc4af: Fix error when accessing a change request not found
- 727bde2: Improve and split OpenAPI parser into its own package
- 0b6ddca: Fix variant selector contrast for non-default themes
- 87b8ea8: Fix issue leading to increase the storage write and the stability of the platform
- fde32e2: Force route handler to be dynamic to avoid errors
- a025118: Change card layout depending on cover aspect ratio
- 300f7bf: Fix search loading state
- 29d5979: Disable C/C++ highlight temporarily
- 18953b2: Subtler tint color when based on the primary color, by mixing in some gray
- 1c97536: Fix Sentry instrumentation
- b0bd871: Even safer localStorage
- b950a64: Avoid errors on legacy browsers
- 38061bd: Add section groups to section tabs
- 160fca1: Support deprecated and x-deprecated-sunset in OpenAPI spec
- 0e601e2: Improve styling of header buttons with shadows and high-contrast styles
- 6691492: Fix viewing PDF from space
- e8e64bf: Fix bullet list display on full size blocks
- 16194c5: Vertical orientation for sections list on sites without header
- b41d425: Improve OpenAPI rendering performances by caching markdown parsing
- 1f8e416: Improve performances by highlighting code client-side if the code block is offscreen
- 1429384: Fix error when accessing some not found pages.
- 21cbd9e: Change link color to primary-subtle
- 5dab70f: Fix "Parser" language syntax highlighting
- deb8c54: Upgrade Next.js to v15, upgrade Shiki and use JS RegExp engine
- 56331d2: Fix breadcrumbs emoji display + add contrast styles
- a6f6591: Fix server actions cache compromised. Leading to some bugs on frontend.
- 44a20fe: Improve smoothness of scroll listener
- 5664e5a: Fix variant dropdown styling in header
- 6b50360: Fix view transition error on Safari
- 741dd49: Bump `heading-3` font size to offset it from paragraphs
- 5112e3e: Fix Sentry instrumentation server-side
- 1de338c: Remove animation on section tabs. Page is reloaded (for technical reasons), so the animation is not accurate here.
- Updated dependencies [d9029c7]
- Updated dependencies [6e54a06]
- Updated dependencies [162b4b7]
- Updated dependencies [e4e2f52]
- Updated dependencies [0c03676]
- Updated dependencies [3e5e458]
- Updated dependencies [46edde9]
- Updated dependencies [d9c8d57]
- Updated dependencies [ccf2cff]
- Updated dependencies [dda0cc6]
- Updated dependencies [eb7c22f]
- Updated dependencies [ea1468c]
- Updated dependencies [648f0e9]
- Updated dependencies [160fca1]
- Updated dependencies [f92e906]
- Updated dependencies [e721f17]
- Updated dependencies [727bde2]
- Updated dependencies [dff08ae]
- Updated dependencies [fc7b16f]
- Updated dependencies [fe8acc9]
- Updated dependencies [1823101]
- Updated dependencies [a652958]
- Updated dependencies [2f73db7]
- Updated dependencies [160fca1]
- Updated dependencies [12c7862]
- Updated dependencies [b41d425]
  - @gitbook/react-openapi@1.0.0
  - @gitbook/openapi-parser@1.0.0
  - @gitbook/react-contentkit@0.6.0

## 0.5.0

### Minor Changes

- 57cdd25: GitBook Open now supports Ask AI in sites. When asking a question to Ask AI, GitBook will use context from across your site sections and variants to provide the best answer.
- ca134c8: Fix an issue where the active site section indicator appeared above any dropdowns.
- d48926e: Fix an issue where the space dropdown was shown under the site sections in Safari.
- 9fe8142: Fix an issue where Ask AI was erroring due to an object being passed as a param.
- d843e5e: Fix an issue where the space dropdown could appear behind the header.
- a2e5647: Fix the styling of site section tabs on smaller screens.

### Patch Changes

- 076dc48: Fix expandable block anchore resolution
- d9bb9f9: Fix an issue with the cookie banner buttons being non responsive
- 23584c9: Update the site header with new styling, a new search button, and refactored layout
- 664debc: Add support for tint color
- 4d56f11: Update styling of search+ask modal
- 061c0c1: Fix a regression in variant drop-down caused by missing z-index.
- 2f76712: Add breadcrumbs above page title
- 07cf835: Add scroll margin to the top when there are sections
- 5d72b35: Smoother tab transition for sections
- 7c71363: Don't adjust fallback font for mono font.
- 7675c2c: Optimize performances by using new API endpoint for fetching site data.
- 87eea73: Fix margin and image resolution of header logo
- aa2ed0f: Restyle hint blocks
- ffd3937: Fix security issue with image resizing that could be used for phishing
- 2ce59d7: Fix - whitespace added to site section tabs with icons.
- c73e07d: Increase token max length to fix code not highlighted
- 3b3d6e2: Add icons to sections
- 1ed18c0: style: adds missing scalar css variables
- Updated dependencies [b7a5106]
- Updated dependencies [4771c78]
- Updated dependencies [ff50ac2]
- Updated dependencies [867481c]
- Updated dependencies [7ba67fd]
- Updated dependencies [a78c1ec]
  - @gitbook/cache-do@0.1.1
  - @gitbook/react-openapi@0.7.1

## 0.4.0

### Minor Changes

- e09f747: Revalidate change request cached content when pressing refresh button
- 2fa0851: Add navigation tabs for sections
- a4b63b8: Support resolution of new site URLs with sections
- 5c35f36: Replace all icons, previously imported from Geist, by new package `@gitbook/icons`
- e9b31a5: Unify section tab styles with page item styles
- f12a215: Add support for Norwegian language
- f4c9536: Optimize layout shift while transitioning between pages with full width blocks (ex: OpenAPI blocks)
- 1f24fe4: Add support for page icons
- cda08a9: Add support for searching results in a sections site
- b32e40c: Persist state of tabs and dynamically sync them based on title
- 15d2ee3: Show the caption for file blocks
- f885e88: Improve the toolbar for change-requests and revisions to show more actions
- 07ea45b: Remove deprecated synced block from GitBook Open
- c3675fd: Added support for new Reusable Content block.
- 1f24fe4: Add support for icons style customization for sites
- 4c19014: Prevent search indexation for pages where it's configured as disabled
- 3422ad4: Update rendering of community ads to match new API response, and make it possible to preview ads.
- 1152445: Changed the alternative URL resolution criteria in order to support site URLs without /v/ prefix
- 2c437f7: Fix linking to a tab itself

### Patch Changes

- aa32198: Avoid multiple <h1> in the page by using a <div> for the title in the header
- 51fa3ab: Adds content-visibility css property to OpenAPI Operation for better render performance
- a7066cc: Fix scroll position when navigating pages on mobile
- c754fc9: Add automatic color contrast in site header, restyle search button
- 5fe7adb: RND-3532: drop down menu for hidden links at small screen size
- 6295881: Change dark mode shadow for multi-space search toolbar
- f89b31c: Upgrade the scalar api client package
- 13c7534: Use ellipsis and fix icon color for more links in the header on small screen
- f885e88: Improve consistency of change request preview by removing cache-control on response
- 16e6171: Improve performances of loading pages with embeds by caching them
- 34d36c6: Fix GitBook specific static assets not being served correctly when deployed on Cloudflare
- af9e66e: Only display spaces dropdown in compact header when site is multi-variants
- e3a3d6a: Improve perception of fast loading by not rendering skeletons for individual blocks in the top part of the viewport
- 042b850: Automatically scroll to active item in TOC
- d43202f: Optimize bundle size of the server output by reducing bundle size of shiki (skipping themes)
- bfbed1a: Ensure "Sponsored via GitBook" can be translated in all languages
- fe9e6c1: Update ogimage with new design
- 17f71ba: Use url hash to open Expandable and scroll to anchor
- 3c07e65: Fix margin for paragraphs in quote blocks
- 636b868: Use new cache backend, powered by Durable Objects, alongside the existing ones (KV, etc).
- f16560c: Include offset in calculations of whether scrollable element is in view
- 689f553: Fix inconsistent click area in table because of scroll indicator
- 6ce3cea: Stop using KV cache backend for now, but also improves it for higher performances
- e914903: Synchronize response and response example tabs
- 0f990c7: Show definition title when visible in cards
- e3a3d6a: Fix flickering when displaying an "Ask" answer with code blocks
- 4cbcc5b: Rollback of scalar modal while fixing perf issue
- 3996110: Optimize images rendered in community ads
- 133c3e7: Update design of Checkbox to be more consistent and readable
- 5096f7f: Disable KV cache for docs.gitbook.com as a test, also disable it for change-request to improve consistency
- 0f1565c: Add optional env `GITBOOK_INTEGRATIONS_HOST` to configure the host serving the integrations
- 2ff7ed1: Fix table of contents being visible on mobile when disabled at the page level
- b075f0f: Fix accessibility of the table of contents by using `aria-current` instead of `aria-selected`
- cb782a7: Fix "ip" being passed to BSA for community ads
- a7af3ca: Improving the look and feel of new section tabs
- 0bf985a: Don't show hidden pages in the empty state of a page
- d6c28a0: Update header styling of sections, variant selector, and button links

  - Change position of variant selector depending on context (next to logo or in table of contents)
  - Update section tab styling and animation
  - Make header buttons smaller with a new `medium` button size

- Updated dependencies [51fa3ab]
- Updated dependencies [9b8d519]
- Updated dependencies [cf3045a]
- Updated dependencies [f89b31c]
- Updated dependencies [d0f4860]
- Updated dependencies [ef9d012]
- Updated dependencies [094e9cd]
- Updated dependencies [636b868]
- Updated dependencies [56f5fa1]
- Updated dependencies [5c35f36]
- Updated dependencies [4247361]
- Updated dependencies [aa8c49e]
- Updated dependencies [e914903]
- Updated dependencies [4cbcc5b]
- Updated dependencies [0f1565c]
- Updated dependencies [237b703]
- Updated dependencies [51955da]
- Updated dependencies [a679e72]
- Updated dependencies [c079c3c]
- Updated dependencies [5c35f36]
- Updated dependencies [776bc31]
  - @gitbook/react-openapi@0.7.0
  - @gitbook/cache-do@0.1.0
  - @gitbook/icons@0.1.0
  - @gitbook/react-contentkit@0.5.1
  - @gitbook/react-math@0.6.0

## 0.3.0

### Minor Changes

- 24b785c: Update shiki for code block syntax highlighting, with support for more languages and fixes for diffs. It also patches the deployment on Cloudflare to support edge functions larger than 4MB.

### Patch Changes

- acc3f2f: Fix error with the "Try it" of OpenAPI block because of the Scalar proxy failing on Cloudflare with the `cache` option
- Updated dependencies [709f1a1]
- Updated dependencies [ede2335]
- Updated dependencies [0426312]
  - @gitbook/react-openapi@0.6.0

## 0.2.2

### Patch Changes

- Updated dependencies [3445db4]
  - @gitbook/react-contentkit@0.5.0
  - @gitbook/react-openapi@0.5.0
  - @gitbook/react-math@0.5.0

## 0.2.1

### Patch Changes

- Updated dependencies [24cd72e]
  - @gitbook/react-contentkit@0.4.0
  - @gitbook/react-math@0.4.0
  - @gitbook/react-openapi@0.4.0

## 0.2.0

### Minor Changes

- de747b7: Refactor the repository to be a proper monorepo and publish JS files on NPM instead of TypeScript files.

### Patch Changes

- Updated dependencies [de747b7]
- Updated dependencies [de747b7]
  - @gitbook/react-contentkit@0.3.0
  - @gitbook/react-openapi@0.3.0
  - @gitbook/react-math@0.3.0
