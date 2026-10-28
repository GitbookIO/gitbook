# Contributing to GitBook

> _For help, support and product questions, head to our [GitHub Community](https://github.com/orgs/GitbookIO/discussions)._

Thanks for helping make GitBook better. This repository holds the open source renderer behind every published GitBook site, and the team reads everything that comes in here.

## Ways to contribute

-   **Open an issue.** Report a bug, suggest a feature, or tell us when something feels off. This is the most useful thing you can do.
-   **Join the conversation.** Share ideas and help others in [GitHub Community](https://github.com/orgs/GitbookIO/discussions).
-   **Build with GitBook.** Publish your docs, try new features early, and tell us what works and what doesn't.

## Issues instead of pull requests

Pull requests are limited to the GitBook team. If you've found a bug or want something to change, please [open an issue](https://github.com/GitbookIO/gitbook/issues/new/choose) instead.

This isn't because we don't want your help. Every change here ships to every published GitBook site, so we need to own each one from start to finish. A clear issue often helps us more than a pull request: it tells us what's wrong and why, and lets us fix it in a way that fits the rest of the codebase.

A good issue includes:

-   What you expected to happen, and what happened instead
-   A link to a published GitBook site that shows the problem, if you have one
-   Steps to reproduce it, plus screenshots or a recording for anything visual
-   Your browser and OS, if it looks like it might matter

Before opening one, [search existing issues](https://github.com/GitbookIO/gitbook/issues). If someone has already reported it, add a 👍 or any extra details you have.

Already fixed it in your fork? Link the branch or commit in your issue. We may open a pull request from it, and your commits keep your name.

If you open a pull request anyway, we'll close it and point you here. Nothing personal, and we'd still love the issue.

## Reach out

Not sure if it's a bug? Have a half-formed idea? Open an issue or start a [discussion](https://github.com/orgs/GitbookIO/discussions) anyway. We'd much rather hear from you than not, and no report is too small.

Spotted a wrong or missing translation? Open an issue with the string and the wording you'd suggest.

## Using AI

You're welcome to use AI to help you write an issue. Please read and check what it produces before you post: reports that are long, vague or unverified take time away from fixing real problems, and we may close them without a reply.

## Running locally

You don't need a local setup to open an issue, but it can help you reproduce a problem or self-host the renderer.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (see "engines" in `package.json`)
-   [Bun](https://bun.sh/) (see "packageManager" in `package.json`)

### Setup

1. Use the project's version of Node:

```bash
nvm use
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun dev
```

Other commands:

-   `bun lint`: Lint the code using Oxlint
-   `bun lint:fix`: Automatically fix lint issues using Oxlint
-   `bun format`: Format the code using Oxfmt
-   `bun format:check`: Check formatting without changing files
-   `bun typecheck`: Run TypeScript type checking
-   `bun unit`: Run unit tests
-   `bun e2e`: Run end-to-end tests

### Preview a site

With the development server running, any published GitBook site can be rendered through your local version at `http://localhost:3000/url/<published-url>`. For example, visit `http://localhost:3000/url/gitbook.com/docs` to see our own docs.

The site must be [published publicly](https://gitbook.com/docs/published-documentation/publish-your-content-as-a-docs-site) to render locally.

## License

The renderer is distributed under the [GNU GPLv3 License](https://github.com/GitbookIO/gitbook/blob/main/LICENSE). If you distribute the code, you must keep the source code public. To use it in a private repository, you need a [commercial license](https://www.gitbook.com/pricing).
