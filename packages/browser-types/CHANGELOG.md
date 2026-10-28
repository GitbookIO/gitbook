# @gitbook/browser-types

## 0.1.6

### Patch Changes

- bf674a4: Add an optional `context` property (string, up to 512 characters) to the `confirmation` of custom AI tools, shown above the confirmation dialog to help the user understand what they are approving or rejecting. The `confirmation` can now also be a function that receives the AI-provided input and returns the confirmation, so the context can be derived dynamically from the arguments the tool is about to run with. Available both to integrations (`GitBookIntegrationTool`) and to embed consumers (`GitBookToolDefinition`).

## 0.1.5

### Patch Changes

- 5f66860: Use isCookiesTrackingDisabled for cookie consent integrations
- 2e495cb: Add Global Privacy Control (GPC) support

## 0.1.4

### Patch Changes

- 7a11861: Add support for custom cookie banner registration
- Updated dependencies [6f1db32]
  - @gitbook/icons@0.4.3

## 0.1.3

### Patch Changes

- 10995e0: Use NPM Trusted publishing for publishing the package.
- Updated dependencies [10995e0]
  - @gitbook/icons@0.3.4

## 0.1.2

### Patch Changes

- 6142d6b: Mark as sideEffects, fix all package bundles
- Updated dependencies [6142d6b]
  - @gitbook/icons@0.3.3

## 0.1.1

### Patch Changes

- 295f03d: Republish packages
- Updated dependencies [295f03d]
  - @gitbook/icons@0.3.2

## 0.1.0

### Minor Changes

- cbc71a5: First version of the public package for typing script integrations.

### Patch Changes

- 854c448: Custom assistants followup
- Updated dependencies [25e2b40]
  - @gitbook/icons@0.3.0
