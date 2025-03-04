# @gitbook/react-openapi

## 1.0.5

### Patch Changes

-   Updated dependencies [53f5dbe]
    -   @gitbook/openapi-parser@2.0.2

## 1.0.4

### Patch Changes

-   722f02e: Fix recursion in OpenAPISchemaAlternative
-   Updated dependencies [0924259]
    -   @gitbook/openapi-parser@2.0.1

## 1.0.3

### Patch Changes

-   dc2dbc5: Update OpenAPI code examples to support multiple content-type
-   f1d1d2f: Return empty string if no server provided
-   05e1d8c: Hide x-gitbook-\* symbols in OpenAPI blocks
-   b4a12d6: Fix circularRef in schema + examples OpenAPI
-   9f0de74: Fix ID not set when there is no operation summary
-   da55fac: Render GitBook blocks in OpenAPI operation description
-   Updated dependencies [c808bb1]
-   Updated dependencies [e24206e]
-   Updated dependencies [a054554]
-   Updated dependencies [da55fac]
    -   @gitbook/openapi-parser@2.0.0

## 1.0.2

### Patch Changes

-   bb5c6a4: Support multiple response media types and examples
-   a3f1fea: Fix display of OpenAPI header description
-   6157583: Improve Markdown parsing
-   7419ee7: Show additional fields in OpenAPI block
-   82cd9f2: Add support for anchor links in OpenAPI blocks
-   Updated dependencies [6157583]
    -   @gitbook/openapi-parser@1.0.1

## 1.0.1

### Patch Changes

-   f8d4c76: Sync tabs across all OpenAPI blocks
-   dddb4ec: Fix long tab group description
-   f8d4c76: Support for OpenAPI references

## 1.0.0

### Major Changes

-   727bde2: Improve and split OpenAPI parser into its own package
-   12c7862: Use `@scalar/openapi-parser` to be more resilient and perf on OpenAPI spec parsing:

    -   `fetcher.fetch` must now returns a valid OpenAPI document
    -   `parseOpenAPIV3` has been replaced by `parseOpenAPI`

### Minor Changes

-   162b4b7: Add in HTTP example code blocks
-   e4e2f52: Add an optional client context to get a callback called when the Scalar client is opened for a block.
-   eb7c22f: Revert scalar to 1.0.87 to mitigate an issue with ApiClientModalProvider
-   160fca1: new OpenAPI blocks design
-   e721f17: Use `@scalar/oas-utils` getExampleFromSchema to generate OpenAPI examples
-   fe8acc9: Fix an issue where a missing OpenAPI example would crash the page.
-   1823101: Fix internal properties appearing in OpenAPI docs.

### Patch Changes

-   d9029c7: Support apiKey in CodeSample security headers
-   6e54a06: Support response examples
-   0c03676: Better securities sample and headers
-   3e5e458: Handle isArray schema type
-   46edde9: Improve the OpenAPI package API
-   d9c8d57: Do not dereference before caching OpenAPI spec.
-   ccf2cff: Fix an issue where a response object using a special ref would crash the page.
-   dda0cc6: Flatten OpenAPI security object
-   f92e906: Prevent codemirror from loading multiple versions in scalar
-   dff08ae: Improve performances by loading Scalar API Client only when the button is clicked
-   fc7b16f: Updated scalar depdenency
-   a652958: Fix error on unresolvable refs by replacing with property name and any type
-   2f73db7: Support non primitive examples in OpenAPI block
-   160fca1: Support deprecated and x-deprecated-sunset in OpenAPI spec
-   b41d425: Improve OpenAPI rendering performances by caching markdown parsing
-   Updated dependencies [46edde9]
-   Updated dependencies [727bde2]
    -   @gitbook/openapi-parser@1.0.0

## 0.7.1

### Patch Changes

-   4771c78: Fixed scalar api client routing
-   ff50ac2: Bump @scalar/api-client-react version
-   867481c: Support Integers in Response example
-   7ba67fd: bumped the scalar api client dependency
-   a78c1ec: Bumped scalar api client pacakge

## 0.7.0

### Minor Changes

-   cf3045a: Add Python support in Code Samples
-   4247361: Add required query parameters to the code sample
-   aa8c49e: Display pattern if available in parmas in OpenAPI block
-   e914903: Synchronize response and response example tabs
-   4cbcc5b: Rollback of scalar modal while fixing perf issue

### Patch Changes

-   51fa3ab: Adds content-visibility css property to OpenAPI Operation for better render performance
-   f89b31c: Upgrade the scalar api client package
-   094e9cd: bump: scalar from 1.0.5 to 1.0.7
-   237b703: Fix crash when `example` is undefined for a response
-   51955da: Adds tabs to Response Example section e.g. for status code examples
-   a679e72: Render mandatory headers in code sample
-   c079c3c: Update Scalar client to latest version

## 0.6.0

### Minor Changes

-   709f1a1: Update Scalar to the latest version, with faster performances and an improved experience

### Patch Changes

-   ede2335: Fix x-codeSamples: false not working at the single operation level
-   0426312: Fix tabs being empty for code samples when they are updated dynamically

## 0.5.0

### Minor Changes

-   3445db4: Fix files published in the NPM packages by defining "files" in "package.json"

## 0.4.0

### Minor Changes

-   24cd72e: Fix changeset CI workflow

## 0.3.0

### Minor Changes

-   de747b7: Refactor the repository to be a proper monorepo and publish JS files on NPM instead of TypeScript files.

## 0.3.0

### Minor Changes

-   bd0ca5b: Fix missing react imports

## 0.2.0

### Minor Changes

-   57adb3e: Second release to fix publishing with changeset

## 0.1.0

### Minor Changes

-   5f8a8fe: Initial release
