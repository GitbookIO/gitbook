<h1 align="center">GitBook</h1>

<p align="center">
  <a href="https://docs.gitbook.com/">Docs</a> - <a href="https://github.com/GitbookIO/community">Community</a> - <a href="https://developer.gitbook.com/">Developer Docs</a> - <a href="https://changelog.gitbook.com/">Changelog</a> - <a href="https://github.com/GitbookIO/gitbook/issues/new?assignees=&labels=bug&template=bug_report.md">Bug reports</a> 
</p>

<p align="center">
  <a href="https://gitbook.com"><img src="https://img.shields.io/static/v1?message=Documented%20on%20GitBook&logo=gitbook&logoColor=ffffff&label=%20&labelColor=5c5c5c&color=3F89A1"></a>
  <a href="#"><img src="https://img.shields.io/badge/Open_Source-❤️-FDA599?"/></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-GNU_GPLv3-F4E28D"/></a>
  <a href="/.github/CONTRIBUTING.md"><img src="https://img.shields.io/github/contributors/gitbookIO/gitbook"/></a>
  <a href="https://github.com/gitbookIO/gitbook/issues"><img src="https://img.shields.io/github/issues/gitbookIO/gitbook"/></a>
</p>

<p align="center">Welcome to GitBook, the platform for managing technical knowledge for teams.</p>

<p align="center">This repository contains the open source code used to render GitBook's published content.</p>

<p align="center">
  <img alt="GitBook Open Published Site" src="./assets/published-site.png">
</p>

## Table of Contents

-   [Getting Started](#getting-started)
-   [Contributing](#contributing)
    -   [Types of contributions](#types-of-contributions)
-   [Licensing](#license)
-   [Acknowledgements](#acknowledgements)
-   [Legacy GitBook](#legacy-gitbook-deprecated)

## Getting Started

To run a local version of this project, please follow these simple steps.

### Prerequisites

-   Node.js (Version: >=18.x)
-   Bun

### Set up

1. Clone the repo into a **public** GitHub repository. If you plan to distribute the code, keep the source code public to comply with GNU GPLv3. To clone in a private repository, acquire a [commercial license](https://www.gitbook.com/pricing).

```
git clone https://github.com/gitbookIO/gitbook.git
```

2. Ensure you are using the project's version of `node`. Running `nvm use` will change your local version to the correct one.

3. Install the project's dependencies through Bun.

```
bun install
```

4. Start your local development server.

```
bun dev
```

5. Open a published GitBook space in your web browser, prefixing it with `http://localhost:3000/`.

examples:

-   http://localhost:3000/docs.gitbook.com
-   http://localhost:3000/open-source.gitbook.io/midjourney

Any published GitBook site can be accessed through your local development instance, and any updates you make to the codebase will be reflected in your browser.

### Other development commands

-   `bun format`: format the code
-   `bun lint`: lint the code

### CI and testing

All pull-requests will be tested against both visual and performances testing to prevent regressions.

## Contributing

GitBook's rendering engine is fully open source and built on top of [Next.js](https://nextjs.org/). Head to our [contributing guide](https://github.com/GitbookIO/gitbook/blob/main/.github/CONTRIBUTING.md) to learn more about the workflow on adding your first Pull Request.

### Types of contributions

We encourage you to contribute to GitBook to help us build the best tool for documenting technical knowledge. If you're looking for some quick ways to contribute, continue reading to learn more about popular contributions.

#### Translations

The GitBook UI is rendered using a set of translation files found in [`packages/gitbook/src/intl/translations`](/packages/gitbook/src/intl/translations/). We welcome all additional translations for the UI.

#### Bugs

Encounter a bug or find an issue you'd like to fix? Helping us fix issues related to GitBook greatly improves the experience for everyone. Head to the issues section of this repository to learn more about the types of bugs you can already help out with.

## Deployment

> [!WARNING]  
> While it is possible to self-host this project, we do not recommend this unless you are certain this option fits your need.
>
> _Looking to add a specific feature in GitBook? Head to our [contributing guide](https://github.com/GitbookIO/gitbook/blob/main/.github/CONTRIBUTING.md) to get started._
>
> Self-hosting this project puts the responsibility of maintaining and merging future updates on **you**. We cannot guarantee support, maintenance, or updates to forked and self-hosted instances of this project.
>
> We want to make it as easy as possible for our community to collaborate and push the future of GitBook, which is why we encourage you to contribute to our product directly instead of creating your own version.

This project allows you to self-host the rendering portion of your GitBook published content. Self-hosting has pros and cons.

On the pro side, you can customize the look and feel of your content, and better embed your documentation in your application.

On the con side, you become responsible for the reliability of your published site, and keeping the renderer up-to-date with the changes made to the GitBook platform.

## License

Distributed under the [GNU GPLv3 License](https://github.com/GitBookIO/gitbook/blob/main/LICENSE).

If you plan to distribute the code, you must make the source code public to comply with the GNU GPLv3. To clone in a private repository, acquire a [commercial license](https://www.gitbook.com/pricing).

See `LICENSE` for more information.

## Acknowledgements

GitBook wouldn't be possible without these projects:

-   [Next.js](https://nextjs.org/)
-   [Bun](https://bun.sh/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Framer Motion](https://www.npmjs.com/package/framer-motion)

## Contributors

<a href="https://github.com/gitbookIO/gitbook/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=gitbookIO/gitbook" />
</a>

## Legacy GitBook (Deprecated)

Our previous version of GitBook and it's CLI tool are now deprecated. You can still view the old repository and it's commits on this [branch](https://github.com/GitbookIO/gitbook/tree/legacy).
