---
"@gitbook/openapi-parser": patch
"@gitbook/react-openapi": patch
"gitbook": patch
---

Add an "Available in MCP" badge on OpenAPI operations marked with `x-gitbook-mcp: true`. When `x-gitbook-mcp-url` is set (on the operation, path, or root — most specific wins), the badge becomes a button that copies the MCP server URL to the clipboard.
