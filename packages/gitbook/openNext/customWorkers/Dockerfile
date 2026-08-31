FROM node:22-slim

WORKDIR /app

# Built by `bun run build:container` (@opennextjs/aws, node wrapper).
COPY .open-next-container/server-functions/default /app

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# In this monorepo the bundle's root index.mjs re-exports packages/gitbook/index.mjs;
# importing it boots the HTTP server.
CMD ["node", "index.mjs"]
