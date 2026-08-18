---
"gitbook": patch
"@gitbook/react-openapi": minor
---

Keep the OpenAPI renderer out of the initial bundle of pages that have no OpenAPI block, by building its context on the client behind a dynamic boundary.
