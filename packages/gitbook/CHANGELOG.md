# gitbook

## 0.18.0

### Minor Changes

- 262afa3: Expose a MCP server for the docs site under /~gitbook/mcp

### Patch Changes

- Updated dependencies [262afa3]
  - @gitbook/icons@0.3.1
  - @gitbook/react-openapi@1.4.3
  - @gitbook/react-contentkit@0.7.5

## 0.17.2

### Patch Changes

- @gitbook/react-openapi@1.4.2

## 0.17.1

### Patch Changes

- 24f601d: Small optim in resolveTryItPrefillForOperation
- aea5eb1: Persist language choice across sections if possible
- 1165a81: Language selector edge cases
- f9a2977: Better handling for external link "mailto:" in Hovered Card in GBO
- Updated dependencies [24f601d]
  - @gitbook/react-openapi@1.4.1

## 0.17.0

### Minor Changes

- 12c9d76: Adapt OpenAPI blocks to eval adaptive exprs & prefill TryIt config
- 7911350: Add language selector to site header
- 659be55: Track insight event when embedded assistant is displayed.

### Patch Changes

- 2e0d706: Fix corner radius of active section on "Line" sidebar style
- 78a632b: Fix edit on GitHub button doesn't take you to GitHub
- 1edc5d6: Add "hold message" to Assistant
- 4520728: Support bold in headings
- 61b8507: OpenAPI: Make responses without objects clickable
- d1fdc13: Remove ligatures from Lato font
- a8fca0e: Fix custom assistant keyboard shortcut
- 262a9b1: Fix embed script and assets being cached for too long
- c890e01: Fix order in robots.txt preventing indexation of images by Google.
- 1839ea2: Fix content min-height with sections
- 9201e2c: Adds vertical align to column block
- 193d591: Use space language as source of truth for UI locale
- f08dd29: Fix Search results are not clickable on sites without header
- 17dd382: Add `original` background color step
- 4f35882: Fix event ask_question not being tracked
- d51b79e: Fix Search bar is broken on site with sections when header is disabled
- 6f368b5: Fix embed assistant window width on small screens
- Updated dependencies [193d591]
- Updated dependencies [12c9d76]
- Updated dependencies [4927e96]
- Updated dependencies [61b8507]
- Updated dependencies [7fefe49]
- Updated dependencies [360aa1c]
- Updated dependencies [98e42cf]
- Updated dependencies [17dd382]
  - @gitbook/colors@0.4.0
  - @gitbook/react-openapi@1.4.0
  - @gitbook/openapi-parser@3.0.2

## 0.16.0

### Minor Changes

- 6830815: Support custom AI providers
- cbc71a5: Allow integrations to provide tools to the Docs Assistant
- cc2e615: Emit a <link rel="alternate"> for the markdown version of a page
- 81a6bd7: Support customization of buttons and tools through iframe API
- 8927e8f: Start routes for embeddable version of the assistant and docs pages.

### Patch Changes

- d30bcba: Improve `Button` and `ButtonGroup` styling
- e1b2cf6: Fix scroll of page outline
- d655d3e: Support "objectivec" as alias for Objective C syntax
- 13ff22b: Fix AI Search follow-up question closing search
- ffa866c: Small fixes to search modal
- 36af03f: Fixes to `PageAside`
- fb858a1: Tweaks to AIChatButton and AIChatInput
- bcfa8d8: Improve vertical alignment of site items and fix floating page aside
- ea7e94f: Fix search bar layout shift caused by ToC
- 2e6e28e: Fix: Long strings overflow out of message bubble in docs assistant
- ff96bb5: Support new coverDefinitionDark for cards & image type
- 388b20d: Clear AI chat properly
- ba7ec14: Fix bug in search highlight in GBO
- 6217a2e: Page outline: scroll to active item
- 42c17f5: Improve OpenAPI parsing errors
- 854c448: Custom assistants followup
- 43766d6: Fix Custom logo not rendering on the published site
- Updated dependencies [cbc71a5]
- Updated dependencies [25e2b40]
- Updated dependencies [42c17f5]
- Updated dependencies [854c448]
  - @gitbook/browser-types@0.1.0
  - @gitbook/icons@0.3.0
  - @gitbook/openapi-parser@3.0.1
  - @gitbook/react-contentkit@0.7.4
  - @gitbook/react-openapi@1.3.6

## 0.15.0

### Minor Changes

- d130532: Suggest questions in the current space context

### Patch Changes

- 44f4151: Fix close buttons tooltips
- d903273: Strip visitor params from URL
- df7de8f: Fix an issue where links were not rendering properly in Ask AI answers
- d270b4a: All tracking is now disabled for dynamic routes such as the site preview.
- b1f608b: Implement basic URL scheme for assistant with ask
- d024658: Prevent page breaks inside blocks when printing
- 185cdb4: Fix scrolling to anchor positionning
- 5c49235: Remove highlighting in Safari for PowerShell and C++ to avoid page crash until next version with bug fix is released
- f1a6dec: Update OpenAPI parser
- 2cdba53: Upgrade to Tailwind v4
- Updated dependencies [2cdba53]
- Updated dependencies [f1a6dec]
  - @gitbook/react-math@0.6.1
  - @gitbook/icons@0.2.2
  - @gitbook/openapi-parser@3.0.0
  - @gitbook/react-contentkit@0.7.3
  - @gitbook/react-openapi@1.3.5

## 0.14.1

### Patch Changes

- 7c951ef: 'Support new colors in text formatting
- 39c4f76: Add fullwidth page option
- eb1bd3a: AI response feedback buttons
- 2ba7e54: Fix headings styles in hint block
- 250c194: Add nosnippet to announcement banner.
- 4aeb81b: Fix search input styling & text cutoff
- 68f0dbc: Add confirmation modal to contentkit button
- 611e286: Remove padding on first Heading in Columns
- b0c534f: Tweaks to AI Chat and AI Actions Dropdown
- Updated dependencies [b5ad0ce]
  - @gitbook/openapi-parser@2.2.2
  - @gitbook/react-openapi@1.3.4

## 0.14.0

### Minor Changes

- 0003030: Implement AI actions dropdown
- acb9f53: New search layout

### Patch Changes

- 334cfdd: Fix responsive class for SearchInput button
- 6816f0f: add browserlists and fix old browser css-masks
- 9ee9082: Refactor icon loading state in AIAction components
- 52ab368: Reposition AI Actions dropdown
- 7212345: Fix AI Actions dropdown and LLM integration
- 8daede5: Ensure all content links are resolved relatively to preview.
- ed684c1: Move AI Actions markdown fetching to client-side
- 9cc5a78: Generalise keyboard shortcuts, add Cmd+J to AI Chat
- Updated dependencies [6816f0f]
- Updated dependencies [1738677]
  - @gitbook/icons@0.2.1
  - @gitbook/openapi-parser@2.2.1
  - @gitbook/react-contentkit@0.7.2
  - @gitbook/react-openapi@1.3.3

## 0.13.1

### Patch Changes

- f5894bc: Fix incorrect revision ID in Markdown fetch logic
- 1b59e7c: Styling improvements to AI Chat Followup questions
- Updated dependencies [bd553bc]
  - @gitbook/openapi-parser@2.2.0
  - @gitbook/react-openapi@1.3.2

## 0.13.0

### Minor Changes

- af98402: Add support for inline icons.
- 7d3fe23: Add circular corners and depth styling
- f3affc3: Display MCP tool calls in AI chat.
- fa12f9e: Support dark-mode specific page cover image
- df848ef: Add support for icons in buttons.
- b7a0db3: Fix rendering of ogimage with SVG logos.
- c3b620e: Best effort at preserving current variant when navigating between sections by matching the pathname against site spaces in the new section.
- 4fb2a4a: Rework full-width layout, add support for full-width page option
- df848ef: Add support for text alignment for headings and paragraphs.
- f033734: Add support for site customization option to change how external links open.
- 7b38f89: Enable AI chat when AI mode is configured to assistant
- 8d65983: Add AI chat

### Patch Changes

- 42d88da: Fix UX issue about highlighting the search term in search result sections
- 6aa3ff9: Fix three small visual issues

  - Fix sidebar showing on `no-toc` pages in the gradient theme
  - Fix variant selector truncating incorrectly in header when sections are present
  - Fix page cover alignment on `lg` screens without TOC

- 015615d: Respect fullWidth and defaultWidth for images
- e8fb84d: Fix hash with align in columns
- 4721403: Hide scrollbar on sections
- d410381: Add docs.testgitbook.com to ADAPTIVE_CONTENT_HOSTS list
- 7d5a6d2: fix nested a tag causing hydration error
- bc1eca8: Error handling for AI Chat
- b3a7ad6: fix href being empty in TOC
- dc4268d: Fix navigation between sections/variants when previewing a site in v2
- 58d7f3c: Fix revision id for computed content
- 11a6511: Fix crash when integration script fails to render block.
- 7a00880: Improve support for OAuth2 security type
- c0ee60e: Adds Columns layout block to GBO
- 9316ccd: Update Models page styling
- 42d43e0: Show scrollbars
- 72cd0e5: Optimize performances by using a smarter per-request cache arround data cached functions
- af66ff7: add a force-revalidate api route to force bust the cache in case of errors
- e2afc07: Fix resolution of page by resolving site redirects before space redirects
- 88a35ed: Fix crash when integration is triggering invalid requests.
- 711cf38: Optimize the fetch of revision files by using only the getRevision cache.
- f58b904: encode customization header
- 4f5fec7: Fix CodeBlock layout
- 3bfe347: Show tabs when there is a single section group present
- a7a713b: Scroll to active TOC when clicking a link
- ba0094a: fix ISR on preview env
- 521052d: Fix concurrent execution in Vercel causing pages to not be attached to the proper tags.
- 33726c8: Generate a llms-full.txt version of the docs site
- 500c8cb: Don't crash ogimage generation on RTL text, as a workaround until we can support it.
- 6859f7d: Fix rendering of ogimage when logo or icon are AVIF images.
- a28a997: Add margin to adjacent buttons
- 67998b6: Fix ogimage generation failing with some JPEG images.
- 8c0a53a: Fix page group not expanded by default
- dfa8a37: Don't cache unexpected API errors for more than a few minutes.
- 73e0cbb: Fix an issue where PDF export URLs were not keeping their query params.
- e5bac69: Fix markdown page generation for groups
- 6294bbb: add a global error boundary
- b60039b: Fix links to other spaces within a section.
- 59da30f: Add support for cover repositioning
- b403962: Handle nullish OpenAPI mediaTypeObject
- c730845: Fix missing title on button to close the announcement banner.
- 231167d: Make icons for page groups more contrasting
- d99da6a: Ignore case while highlighting search results.
- dae019c: Consistently show variant selector in section bar if site has sections
- dd65987: Include page group children under the .md route
- 57bb146: Make TOC height dynamic based on visible header and footer elements
- 4f7c0ee: Clicking an active TOC item toggles its descendants
- ca3b9ac: Improve AI Chat context popup
- 5726999: Fix viewing a page from a revision
- 392f594: Fix InlineLinkTooltip having a negative impact on performance, especially on larger pages.
- c9373ef: Fix bold header links hover color
- fa3eb07: cache fonts and static image used in OGImage in memory
- e7a591d: Fix border being added to cards
- 427f748: Add metadata for adding site to Apple devices home
- a3a944d: Fix crash during rendering of ogimage for VA sites with default icon.
- 4b67fe5: Add `urlObject.hash` to `linker.toLinkForContent` to pass through URL fragment identifiers, used in search
- caaa692: Allow to zoom images on mobile if relevant
- 902c3c6: apply customization for dynamic context
- b6b5975: Reverse order of feedback smileys
- fbfcca5: Fix ogimage using incorrect Google Font depending on language.
- 2932077: remove trailing slash from linker
- 2350baa: Support for OpenAPI Array request body
- Updated dependencies [957afd9]
- Updated dependencies [7a00880]
- Updated dependencies [11a6511]
- Updated dependencies [fbfcca5]
- Updated dependencies [a0c06a7]
- Updated dependencies [b403962]
- Updated dependencies [1e013cd]
- Updated dependencies [4f5cbfe]
- Updated dependencies [4c9a9d0]
- Updated dependencies [40df91a]
- Updated dependencies [2350baa]
  - @gitbook/react-openapi@1.3.1
  - @gitbook/react-contentkit@0.7.1
  - @gitbook/fonts@0.1.0
  - @gitbook/openapi-parser@2.1.5

## 0.12.0

### Minor Changes

- 8339e91: Fix images in reusable content across spaces.
- 326e28e: Design tweaks to code blocks and OpenAPI pages
- 3119066: Add support for reusable content across spaces.
- 7d7806d: Pass SVG images through image resizing without resizing them to serve them from optimal host.

### Patch Changes

- c4ebb3f: Fix openapi-select hover in responses
- aed79fd: Decrease rounding of header logo
- 42ca7e1: Fix openapi CR preview
- e6ddc0f: Fix URL in sitemap
- 5e975ab: Fix code highlighting for HTTP
- 5d504ff: Fix resolution of links in reusable contents
- 95a1f65: Better print layouts: wrap code blocks & force table column auto-sizing
- 0499966: Fix invalid sitemap.xml generated with relative URLs instead of absolute ones
- 2a805cc: Change OpenAPI schema-optional from `info` to `tint` color
- 580101d: Fix schemas disclosure label causing client error
- 12a455d: Fix OpenAPI layout issues
- 97b7c79: Increase logging around caching behaviour causing page crashes.
- 373f18f: Prevent section group popovers from opening on click
- 3f29206: Update the regex for validating site redirect
- 0c973a3: Always link main logo to the root of the site
- ae5f1ab: Change `Dropdown`s to use Radix's `DropdownMenu`
- 0e201d5: Add border to filled sidebar on gradient theme
- dd043df: Revert investigation work around URL caches.
- 89a5816: Fix OpenAPI disclosure label ("Show properties") misalignment on mobile
- Updated dependencies [c3f6b8c]
- Updated dependencies [d00dc8c]
- Updated dependencies [42ca7e1]
- Updated dependencies [326e28e]
- Updated dependencies [5e975ab]
- Updated dependencies [f7a3470]
- Updated dependencies [580101d]
- Updated dependencies [20ebecb]
- Updated dependencies [80cb52a]
- Updated dependencies [cb5598d]
- Updated dependencies [c6637b0]
- Updated dependencies [a3ec264]
  - @gitbook/colors@0.3.3
  - @gitbook/openapi-parser@2.1.4
  - @gitbook/react-openapi@1.3.0

## 0.11.1

### Patch Changes

- Updated dependencies [ebc39e9]
- Updated dependencies [b6b09d4]
  - @gitbook/react-openapi@1.2.1

## 0.11.0

### Minor Changes

- d67699a: Add OpenAPI Webhook block

### Patch Changes

- 4b8a621: Show sections tabs only if there is at least two sections
- 8ed1bda: Translate OpenAPI blocks
- 7588cfe: Improve OpenAPIResponses examples and schemas
- Updated dependencies [eeb977f]
- Updated dependencies [3363a18]
- Updated dependencies [d67699a]
- Updated dependencies [8ed1bda]
- Updated dependencies [7588cfe]
- Updated dependencies [ad1dc0b]
  - @gitbook/react-openapi@1.2.0

## 0.10.1

### Patch Changes

- Updated dependencies [77397ca]
  - @gitbook/cache-tags@0.3.1

## 0.10.0

### Minor Changes

- b62b101: Do not set cookie to identify visitor for insights when disabled.

### Patch Changes

- 95ea22d: Cache AI Page Link summary
- daf41fc: Tweak footer design (and refactor)
- de53946: Fix security issue with injection of "javacript:` url in the back button of PDFs
- b92ecfa: Implement retry logic for the DO cache to prevent when revalidating content.
- 528eee3: Add superscript and subscript text rendering
- aa3357a: Fix OpenAPISchemas description padding
- 168a4fa: Add support for buttons to GitBook.
- 70c4182: Improve OpenAPI schema style
- 2b6c593: Remove stable from x-stability
- 580f7ad: Improve the error message returned by the revalidate endpoint.
- cbd768a: Improve OpenAPI codesample (add OpenAPISelect component)
- c765463: Fix ogimage generation crashing when site is using a custom WOFF2 font
- e59076a: Improve OpenAPI schemas block ungrouped style. Classnames have changed, please refer to this PR to update GBX.
- 29aaba5: Override Scalar's overscroll-behavior
- 90ead98: Better error handling in cache revalidation.
- Updated dependencies [116575c]
- Updated dependencies [cdffd7c]
- Updated dependencies [70c4182]
- Updated dependencies [2b6c593]
- Updated dependencies [cbd768a]
- Updated dependencies [e59076a]
- Updated dependencies [eedefdd]
- Updated dependencies [23cedd2]
  - @gitbook/cache-tags@0.3.0
  - @gitbook/colors@0.3.2
  - @gitbook/react-openapi@1.1.10
  - @gitbook/openapi-parser@2.1.3

## 0.9.2

### Patch Changes

- da7b369: Fix missing headers in OpenAPIResponses
- 139a805: Fix OpenAPI enum display
- Updated dependencies [da7b369]
- Updated dependencies [da485f5]
- Updated dependencies [139a805]
  - @gitbook/react-openapi@1.1.9

## 0.9.1

### Patch Changes

- fb90eb0: Limit tinted background on bold theme to sites with filled sidebar
- 7d0b422: Handle grouped OpenAPISchemas
- Updated dependencies [7d0b422]
- Updated dependencies [fb90eb0]
  - @gitbook/react-openapi@1.1.8
  - @gitbook/colors@0.3.1

## 0.9.0

### Minor Changes

- 77fd393: Track event when visitor is opening a search result.
- d70d566: Support site announcement banner
- 77fd393: Track event when clicking announcement banner link.

### Patch Changes

- e84a46a: Fix OpenAPI tabs indicator overflow
- bc90adb: Fix favicon not being displayed in Google because `robots.txt` was preventing the indexation of the image route
- 434af90: Fix image resizing when using the proxy feature in a site.
- c756761: Add breadcrumbs to search results
- 40e8e69: Disallow crawling by web-robots of search/ask URLs
- 77fd393: Fix clicking search results when the site is embedded in an iframe.
- 1505ddb: Fix multiple request examples selector not showing
- 61db166: Add OpenAPI write-only indicator
- 6f71da8: Fix padding in schemas
- fa91eb7: Fix PDF generation when user has dark mode configured.
- 5b1e01c: Support for x-stability property
- 57ca4e0: Fix a crash when a page contains a block of an integration that is no longer installed
- d236bf0: Fix flash when loading sites with dark mode as default theme
- cd99ed5: Fix spec properties rendering and missing keys
- 813b2af: Support for x-enumDescriptions and x-gitbook-enum
- e9fa50d: Trim the search query to avoid showing a loading state when typing
- Updated dependencies [bd35348]
- Updated dependencies [ae78fc5]
- Updated dependencies [7bb37c7]
- Updated dependencies [373183a]
- Updated dependencies [1505ddb]
- Updated dependencies [61db166]
- Updated dependencies [5b1e01c]
- Updated dependencies [cd99ed5]
- Updated dependencies [813b2af]
- Updated dependencies [a25fded]
  - @gitbook/react-openapi@1.1.7
  - @gitbook/openapi-parser@2.1.2

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
- 5096f7f: Disable KV cache for gitbook.com/docs as a test, also disable it for change-request to improve consistency
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
