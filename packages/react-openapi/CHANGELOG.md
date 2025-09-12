# @gitbook/react-openapi

## 1.4.3

### Patch Changes

- Updated dependencies [6da3655]
  - @gitbook/expr@1.2.0

## 1.4.2

### Patch Changes

- Updated dependencies [3548fa6]
  - @gitbook/expr@1.1.1

## 1.4.1

### Patch Changes

- 24f601d: Small optim in resolveTryItPrefillForOperation
- Updated dependencies [e1ff17e]
- Updated dependencies [8ff1e3b]
  - @gitbook/expr@1.1.0

## 1.4.0

### Minor Changes

- 12c9d76: Adapt OpenAPI blocks to eval adaptive exprs & prefill TryIt config

### Patch Changes

- 4927e96: Add support for YAML content type in request body/example
- 61b8507: OpenAPI: Make responses without objects clickable
- 98e42cf: Handle OpenAPI ignored responses
- Updated dependencies [12c9d76]
- Updated dependencies [7fefe49]
- Updated dependencies [360aa1c]
  - @gitbook/openapi-parser@3.0.2

## 1.3.6

### Patch Changes

- Updated dependencies [42c17f5]
  - @gitbook/openapi-parser@3.0.1

## 1.3.5

### Patch Changes

- Updated dependencies [f1a6dec]
  - @gitbook/openapi-parser@3.0.0

## 1.3.4

### Patch Changes

- Updated dependencies [b5ad0ce]
  - @gitbook/openapi-parser@2.2.2

## 1.3.3

### Patch Changes

- Updated dependencies [1738677]
  - @gitbook/openapi-parser@2.2.1

## 1.3.2

### Patch Changes

- Updated dependencies [bd553bc]
  - @gitbook/openapi-parser@2.2.0

## 1.3.1

### Patch Changes

- 957afd9: Add authorization header for OAuth2
- 7a00880: Improve support for OAuth2 security type
- a0c06a7: Indent JSON python code sample
- b403962: Handle nullish OpenAPI mediaTypeObject
- 1e013cd: Optional label in OpenAPI x-codeSamples
- 4c9a9d0: Handle nested deprecated properties in generateSchemaExample
- 40df91a: Deduplicate path parameters from OpenAPI spec
- 2350baa: Support for OpenAPI Array request body
- Updated dependencies [1e013cd]
- Updated dependencies [4f5cbfe]
  - @gitbook/openapi-parser@2.1.5

## 1.3.0

### Minor Changes

- 326e28e: Design tweaks to code blocks and OpenAPI pages

### Patch Changes

- 42ca7e1: Fix openapi CR preview
- 5e975ab: Fix code highlighting for HTTP
- 580101d: Fix schemas disclosure label causing client error
- 20ebecb: Missing top-level required OpenAPI alternatives
- 80cb52a: Handle OpenAPI alternatives from schema.items
- cb5598d: Handle invalid OpenAPI Responses
- c6637b0: Use default value if string number or boolean in generateSchemaExample
- a3ec264: Fix Python code sample "null vs None"
- Updated dependencies [d00dc8c]
  - @gitbook/openapi-parser@2.1.4

## 1.2.1

### Patch Changes

- ebc39e9: Missing select icon
- b6b09d4: Fix OpenAPI responses select placement and icon

## 1.2.0

### Minor Changes

- d67699a: Add OpenAPI Webhook block

### Patch Changes

- eeb977f: Fix Python code example for JSON payload
- 3363a18: Merge simple alternatives
- 8ed1bda: Translate OpenAPI blocks
- 7588cfe: Improve OpenAPIResponses examples and schemas
- ad1dc0b: Bump scalar packages

## 1.1.10

### Patch Changes

- 70c4182: Improve OpenAPI schema style
- 2b6c593: Remove stable from x-stability
- cbd768a: Improve OpenAPI codesample (add OpenAPISelect component)
- e59076a: Improve OpenAPI schemas block ungrouped style. Classnames have changed, please refer to this PR to update GBX.
- eedefdd: Handle optional security headers
- 23cedd2: Hide deprecated properties in examples
- Updated dependencies [2b6c593]
  - @gitbook/openapi-parser@2.1.3

## 1.1.9

### Patch Changes

- da7b369: Fix missing headers in OpenAPIResponses
- da485f5: Fix read-only in generateSchemaExample
- 139a805: Fix OpenAPI enum display

## 1.1.8

### Patch Changes

- 7d0b422: Handle grouped OpenAPISchemas

## 1.1.7

### Patch Changes

- bd35348: Fix missing alternative schemas
- ae78fc5: Fix XML in code sample
- 7bb37c7: Move filterSelectedOpenAPISchemas to @gitbook/openapi-parser
- 373183a: Safe parse OpenAPI JSON schema
- 1505ddb: Fix multiple request examples selector not showing
- 61db166: Add OpenAPI write-only indicator
- 5b1e01c: Support for x-stability property
- cd99ed5: Fix spec properties rendering and missing keys
- 813b2af: Support for x-enumDescriptions and x-gitbook-enum
- a25fded: Replace $ref with $reference in json-decycle
- Updated dependencies [7bb37c7]
- Updated dependencies [5b1e01c]
- Updated dependencies [813b2af]
  - @gitbook/openapi-parser@2.1.2

## 1.1.6

### Patch Changes

- 6eae764: Support body examples
- 7212973: Update scalar
- d2facb2: Mark properties as optional if not required
- 73e2b47: Fix write only properties in request example
- 70be2c6: Stringify default value
- fc00b51: Remove default value in generateSchemaExample
- a84b06b: Update resolveDescription and add minItems/maxItems
- Updated dependencies [48c18c0]
- Updated dependencies [7212973]
  - @gitbook/openapi-parser@2.1.1

## 1.1.5

### Patch Changes

- 886e204: Update OpenAPI operation path design

## 1.1.4

### Patch Changes

- c60e9ba: Handle read-only in OpenAPISchemaName
- 31d800e: Render OpenAPISchemas block
- ff3b708: Remove read-only properties from codesample

## 1.1.3

### Patch Changes

- 844059f: Fix spacing in OpenAPISecurities

## 1.1.2

### Patch Changes

- f127d28: Rename OpenAPIModels to OpenAPISchemas

## 1.1.1

### Patch Changes

- f574858: Fix OpenAPI example display error

## 1.1.0

### Minor Changes

- bb3ca9c: Implement OpenAPI models blocks

### Patch Changes

- 0278a14: Upgrade Scalar dependencies
- 3173d8e: Remove top level circular refs in alternatives
- Updated dependencies [0278a14]
- Updated dependencies [bb3ca9c]
- Updated dependencies [052e07a]
  - @gitbook/openapi-parser@2.1.0

## 1.0.5

### Patch Changes

- Updated dependencies [53f5dbe]
  - @gitbook/openapi-parser@2.0.2

## 1.0.4

### Patch Changes

- 722f02e: Fix recursion in OpenAPISchemaAlternative
- Updated dependencies [0924259]
  - @gitbook/openapi-parser@2.0.1

## 1.0.3

### Patch Changes

- dc2dbc5: Update OpenAPI code examples to support multiple content-type
- f1d1d2f: Return empty string if no server provided
- 05e1d8c: Hide x-gitbook-\* symbols in OpenAPI blocks
- b4a12d6: Fix circularRef in schema + examples OpenAPI
- 9f0de74: Fix ID not set when there is no operation summary
- da55fac: Render GitBook blocks in OpenAPI operation description
- Updated dependencies [c808bb1]
- Updated dependencies [e24206e]
- Updated dependencies [a054554]
- Updated dependencies [da55fac]
  - @gitbook/openapi-parser@2.0.0

## 1.0.2

### Patch Changes

- bb5c6a4: Support multiple response media types and examples
- a3f1fea: Fix display of OpenAPI header description
- 6157583: Improve Markdown parsing
- 7419ee7: Show additional fields in OpenAPI block
- 82cd9f2: Add support for anchor links in OpenAPI blocks
- Updated dependencies [6157583]
  - @gitbook/openapi-parser@1.0.1

## 1.0.1

### Patch Changes

- f8d4c76: Sync tabs across all OpenAPI blocks
- dddb4ec: Fix long tab group description
- f8d4c76: Support for OpenAPI references

## 1.0.0

### Major Changes

- 727bde2: Improve and split OpenAPI parser into its own package
- 12c7862: Use `@scalar/openapi-parser` to be more resilient and perf on OpenAPI spec parsing:

  - `fetcher.fetch` must now returns a valid OpenAPI document
  - `parseOpenAPIV3` has been replaced by `parseOpenAPI`

### Minor Changes

- 162b4b7: Add in HTTP example code blocks
- e4e2f52: Add an optional client context to get a callback called when the Scalar client is opened for a block.
- eb7c22f: Revert scalar to 1.0.87 to mitigate an issue with ApiClientModalProvider
- 160fca1: new OpenAPI blocks design
- e721f17: Use `@scalar/oas-utils` getExampleFromSchema to generate OpenAPI examples
- fe8acc9: Fix an issue where a missing OpenAPI example would crash the page.
- 1823101: Fix internal properties appearing in OpenAPI docs.

### Patch Changes

- d9029c7: Support apiKey in CodeSample security headers
- 6e54a06: Support response examples
- 0c03676: Better securities sample and headers
- 3e5e458: Handle isArray schema type
- 46edde9: Improve the OpenAPI package API
- d9c8d57: Do not dereference before caching OpenAPI spec.
- ccf2cff: Fix an issue where a response object using a special ref would crash the page.
- dda0cc6: Flatten OpenAPI security object
- f92e906: Prevent codemirror from loading multiple versions in scalar
- dff08ae: Improve performances by loading Scalar API Client only when the button is clicked
- fc7b16f: Updated scalar depdenency
- a652958: Fix error on unresolvable refs by replacing with property name and any type
- 2f73db7: Support non primitive examples in OpenAPI block
- 160fca1: Support deprecated and x-deprecated-sunset in OpenAPI spec
- b41d425: Improve OpenAPI rendering performances by caching markdown parsing
- Updated dependencies [46edde9]
- Updated dependencies [727bde2]
  - @gitbook/openapi-parser@1.0.0

## 0.7.1

### Patch Changes

- 4771c78: Fixed scalar api client routing
- ff50ac2: Bump @scalar/api-client-react version
- 867481c: Support Integers in Response example
- 7ba67fd: bumped the scalar api client dependency
- a78c1ec: Bumped scalar api client pacakge

## 0.7.0

### Minor Changes

- cf3045a: Add Python support in Code Samples
- 4247361: Add required query parameters to the code sample
- aa8c49e: Display pattern if available in parmas in OpenAPI block
- e914903: Synchronize response and response example tabs
- 4cbcc5b: Rollback of scalar modal while fixing perf issue

### Patch Changes

- 51fa3ab: Adds content-visibility css property to OpenAPI Operation for better render performance
- f89b31c: Upgrade the scalar api client package
- 094e9cd: bump: scalar from 1.0.5 to 1.0.7
- 237b703: Fix crash when `example` is undefined for a response
- 51955da: Adds tabs to Response Example section e.g. for status code examples
- a679e72: Render mandatory headers in code sample
- c079c3c: Update Scalar client to latest version

## 0.6.0

### Minor Changes

- 709f1a1: Update Scalar to the latest version, with faster performances and an improved experience

### Patch Changes

- ede2335: Fix x-codeSamples: false not working at the single operation level
- 0426312: Fix tabs being empty for code samples when they are updated dynamically

## 0.5.0

### Minor Changes

- 3445db4: Fix files published in the NPM packages by defining "files" in "package.json"

## 0.4.0

### Minor Changes

- 24cd72e: Fix changeset CI workflow

## 0.3.0

### Minor Changes

- de747b7: Refactor the repository to be a proper monorepo and publish JS files on NPM instead of TypeScript files.

## 0.3.0

### Minor Changes

- bd0ca5b: Fix missing react imports

## 0.2.0

### Minor Changes

- 57adb3e: Second release to fix publishing with changeset

## 0.1.0

### Minor Changes

- 5f8a8fe: Initial release
