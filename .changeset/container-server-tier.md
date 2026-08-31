---
"gitbook": patch
---

Add a container server tier: an `@opennextjs/aws` node build of the app running inside a Cloudflare Container, reaching the cache worker through the container Durable Object's outbound handler. Build it with `bun run build:all` and run it locally with `bun run dev:cf:container`.
