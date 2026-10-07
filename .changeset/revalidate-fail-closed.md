---
"gitbook": patch
---

Fail closed in `/~gitbook/revalidate` when `GITBOOK_SECRET` is not configured, returning `403 Revalidation is disabled` instead of skipping the signature check, consistent with `force-revalidate`.
