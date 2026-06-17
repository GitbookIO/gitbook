---
"gitbook": patch
---

Trust an optional cookieless integration content host (`GITBOOK_INTEGRATIONS_CONTENT_HOST`) for WebFrame postMessage, in preparation for isolating integration-rendered content onto a separate origin. Defaults to `GITBOOK_INTEGRATIONS_HOST`, so behavior is unchanged until the content host is configured.
