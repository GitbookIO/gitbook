---
"gitbook": patch
---

Add a container server tier: an `@opennextjs/aws` node build of the app running inside a Cloudflare Container, reaching the cache worker through the container Durable Object's outbound handler. Local dev only for now (`bun run build:all`, `bun run dev:cf:container`).
