---
"gitbook": patch
---

Fix analytics and adaptive content silently breaking on sites served from a different host than the one configured (apex vs www, domain alias, CDN). The insights and visitor-claims endpoints are now requested relative to the page's own origin instead of the configured host, which a prerendered page cannot know.

Stop tracking events when a site is served through `/url/:url` on GitBook's own host, the access mode used by local development and preview deployments. That traffic is not the site's and no longer reaches its analytics.
