---
"@gitbook/react-openapi": major
"gitbook": patch
---

Lazy load the Scalar API client modal and stop preloading the Scalar runtime. The modal is now code-split into its own chunk, fetched in parallel with the runtime only when a reader clicks "Test it", and a spinner is shown on the button until the client opens.

Breaking: the package no longer ships the modal in its main entry — consumers must serve the emitted `ScalarApiModal` chunk and use a bundler that supports dynamic `import()`, and the Scalar runtime is no longer preloaded on page load. The internal `preloadScalarRuntime` helper is removed.
