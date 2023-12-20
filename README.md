# GitBook

Next.js application to render GitBook published content.

## Development

#### Start the local server

Clone the repository and use [Bun](https://bun.sh/) to install dependencies and run the local development server.

```
bun install
```

Run the Next.js development server:

```
bun dev
```

Then open the space in your web browser, using `http://localhost:3000/<host>/<path>` (example: `http://localhost:3000/docs.gitbook.com`).

#### Other development commands

-   `bun format`: format the code
-   `bun lint`: lint the code

#### CI and testing

All pull-requests will be tested against both visual and performances testing to prevent regressions.

## Self-hosting

This repository is designed to allow self-hosting the rendering of your GitBook published content. Self-hosting has pros and cons, on the pro side you can customize the look and feel and better embed your documentation in your application; on the cons side you become responsible for the reliability and keeping the renderer up-to-date with the changes on the GitBook platform.

This application can easily be configured and deployed on Vercel or Cloudflare to serve a specific space content (**self-hosting**). It requires a minimum amount of configuration:

-   `GITBOOK_MODE=single`
-   `GITBOOK_SPACE_ID`: ID of the GitBook.com space to render
-   `GITBOOK_TOKEN`: a GitBook.com API token that has access to the space defined in `GITBOOK_SPACE_ID`
