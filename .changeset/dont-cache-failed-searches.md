---
"gitbook": patch
---

Stop caching failed searches, so a rate-limited or failing search is retried on the next query instead of being served from cache for 15 minutes.
