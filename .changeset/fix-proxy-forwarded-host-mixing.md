---
"gitbook": patch
---

Fix a "Domain not found" error that could occur for sites published on a subdirectory proxy (e.g. `company.com/docs`) when the request was served through a proxy that forwards its own host. Such requests are now resolved by their proxy site path instead of the forwarded host.
