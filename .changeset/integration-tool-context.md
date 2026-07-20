---
"@gitbook/browser-types": patch
"@gitbook/embed": patch
"gitbook": patch
---

Add an optional `context` property to the `confirmation` of custom AI tools (string, up to 512 characters), shown above the confirmation dialog to help the user understand what they are approving or rejecting. Available both to integrations (`GitBookIntegrationTool`) and to embed consumers (`GitBookToolDefinition`).
