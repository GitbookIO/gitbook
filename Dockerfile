FROM node:22-alpine
WORKDIR /app
COPY ./packages/gitbook-v2/.open-next/server-functions/default /app
EXPOSE 3000
CMD ["node", "index.mjs"]