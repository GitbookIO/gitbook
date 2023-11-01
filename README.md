# GitBook

Next.js application to render GitBook published content.

## Development

#### Installation

Clone the repository and use [Bun](https://bun.sh/) to install dependencies and run the local development server.

```
bun install
```

#### Configuration

To develop and test a GitBook space locally, first create a [GitBook API token](https://app.gitbook.com/account/developer) and put it in a `.env.local` file:

```
GITBOOK_TOKEN=gb_api_abc
```

#### Start the local server

Run the Next.js development server.

```
bun dev
```

Then open the space in your web browser: `http://localhost:3000/<space>/`.

#### Other commands

-   `bun format`: format the code
-   `bun lint`: lint the code

## Differences

-   Changed: Full-width mode:
    -   When off, layout is centered
    -   It now detects based on the page
-   New: Scroll to top button in page aside
-   New: Proper RTL support
-   New: Per page OpenGraph cover image
