---
"gitbook": patch
---

Skip internal paths (`~gitbook/*`, `.well-known/oauth-protected-resource`, `llms.txt`, `robots.txt`, `sitemap.xml`, `rss.xml`) when building URL lookup alternatives, to avoid resolving URLs that can never match content.
