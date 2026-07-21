---
"@gitbook/browser-types": patch
"@gitbook/embed": patch
"gitbook": patch
---

Add an optional `context` property (string, up to 512 characters) to the `confirmation` of custom AI tools, shown above the confirmation dialog to help the user understand what they are approving or rejecting. The `confirmation` can now also be a function that receives the AI-provided input and returns the confirmation, so the context can be derived dynamically from the arguments the tool is about to run with. Available both to integrations (`GitBookIntegrationTool`) and to embed consumers (`GitBookToolDefinition`).
