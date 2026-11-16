---
"gitbook": patch
---

Reduce memory and CPU use of the OpenNext workers: minify the middleware, resolve the site context once per request, cache parsed OpenAPI descriptions across a spec, drop the redis client and the unused force-revalidate route from the server bundle.
