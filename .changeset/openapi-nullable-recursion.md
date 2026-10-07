---
"@gitbook/react-openapi": patch
"gitbook": patch
---

Fix OpenAPI schemas that reference themselves through a nullable union rendering forever when expanded, which crashed PDF exports.
