# @gitbook/openapi-parser

## 3.0.2

### Patch Changes

- 12c9d76: Adapt OpenAPI blocks to eval adaptive exprs & prefill TryIt config
- 7fefe49: Catch OpenAPI validation errors
- 360aa1c: Upgrade Scalar dependencies

## 3.0.1

### Patch Changes

- 42c17f5: Improve OpenAPI parsing errors

## 3.0.0

### Major Changes

- f1a6dec: Less strict OpenAPI parser, now returns { errors, filesystem }

## 2.2.2

### Patch Changes

- b5ad0ce: Fix OpenAPI v2 parsing

## 2.2.1

### Patch Changes

- 1738677: Stricter validation

## 2.2.0

### Minor Changes

- bd553bc: Expose `isJson` and `isYaml` in OpenAPI parser

## 2.1.5

### Patch Changes

- 1e013cd: Optional label in OpenAPI x-codeSamples
- 4f5cbfe: Upgrade Scalar parser

## 2.1.4

### Patch Changes

- d00dc8c: Pass scalar's errors through OpenAPIParseError

## 2.1.3

### Patch Changes

- 2b6c593: Remove stable from x-stability

## 2.1.2

### Patch Changes

- 7bb37c7: Move filterSelectedOpenAPISchemas to @gitbook/openapi-parser
- 5b1e01c: Support for x-stability property
- 813b2af: Support for x-enumDescriptions and x-gitbook-enum

## 2.1.1

### Patch Changes

- 48c18c0: Add option to pass scalar plugins
- 7212973: Update scalar

## 2.1.0

### Minor Changes

- bb3ca9c: Implement OpenAPI models blocks

### Patch Changes

- 0278a14: Upgrade Scalar dependencies
- 052e07a: Support references pointing to invalid files

## 2.0.2

### Patch Changes

- 53f5dbe: Fix typing of `shouldIgnoreEntity`

## 2.0.1

### Patch Changes

- 0924259: Expose helper `shouldIgnoreEntity`

## 2.0.0

### Major Changes

- e24206e: Use Scalar parser to upgrade OpenAPI spec v2

### Patch Changes

- c808bb1: Fallback to untrusted validation in case JSON spec is invalid
- a054554: Implement a trusted mode to speed up OpenAPI spec validation
- da55fac: Render GitBook blocks in OpenAPI operation description

## 1.0.1

### Patch Changes

- 6157583: Improve Markdown parsing

## 1.0.0

### Major Changes

- 727bde2: Improve and split OpenAPI parser into its own package

### Patch Changes

- 46edde9: Improve the OpenAPI package API
