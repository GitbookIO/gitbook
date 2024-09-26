# Welcome to GitBook's contributing guide!

> _For help, support, feature requests, and product questions - head to our [GitHub Community](https://github.com/orgs/GitbookIO/discussions) 🤖_

Thank you for investing your time in contributing to GitBook. Any contribution you make will be reviewed by our team. In this guide, you'll learn the different ways you can contribute.

## Types of Contributions

This repository contains code related to the rendering engine of GitBook's published content. Depending on what you'd like to contribute to, head to the section below to find the necessary steps.

### Add a feature

Because this portion of GitBook is open source and available for you to use - if you think you can provide extra value through a new feature - you're welcome to add it! If you plan to distribute the code, keep the source code public to comply with GNU GPLv3. To clone in a private repository, you must first acquire a [commercial license](https://www.gitbook.com/pricing).

### Create a new issue

If you spot a problem within a repository, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue here!Please make sure any added issues are

-   Descriptive
-   Thoughtful
-   Organized

We recommend adding as many relevant links, minimal reproductions of the issue, and other materials that will help our team solve the issue fast.

### Solve an issue

If you're interested in solving an issue in our repository, start by scanning through it's exisiting issues to find one that you're interested in working on. If you find an issue to work on, you are welcome to open a PR with a fix. See the following sections below for more information on contributing for specific sections.

### Documentation

The official documentation on GitBook open can be found directly in this Readme. Any updates or changes you would like to make, you can make directly to the README of this repository.

## Contributing

### Make changes locally

Any contribution you make can be made to the code located in this repository. In order to contribute, you'll need to start off of a local version of this repository.

#### 1. Fork the repository

##### Using GitHub Desktop:

-   [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
-   Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

##### Using the command line:

-   [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

#### 2. Create a working branch and start with your changes

After forking this repository, you'll want to [create a branch](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-a-branch-for-an-issue) to work off of.

#### 3. Install dependencies and run the project locally

GitBook uses [Bun](https://bun.sh/) to run the project. Make sure you're using the specified version of `node` before running any of the development commands to ensure a smooth development experience.

You can easily do this by running the command `nvm use`.

To start your local version of GitBook, run the command `bun dev`.

#### 4. Preview your changes

When running the development server, published GitBook sites can be rendered through your local version at `http://localhost:3000/`.

For example, our published docs can be viewed using the local version by visiting `http://localhost:3000/docs.gitbook.com` after running the development server.

You can visit any published GitBook site behind your development server. Please make sure your site is [published publicly](https://docs.gitbook.com/published-documentation/publish-your-content-as-a-docs-site) to ensure you can view the site correctly in your development version.

### Commit your update

[Commit your changes](https://github.com/git-guides/git-commit) once you are happy with them. See [Atom's contributing guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md#git-commit-messages) to know how to use emoji for commit messages!

Once your changes are ready, don't forget to self-review your code to double check that your chagnes are ready to be added.

### Pull Request

When you're finished with the changes, [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request), also known as a PR.

-   Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
-   Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge. Once you submit your PR, a GitBook team member will review your proposal. We may ask questions or request for additional information.
-   We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
-   As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
-   If you run into any merge issues, checkout this [git tutorial](https://lab.github.com/githubtraining/managing-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged

Congratulations 🎉 Thank you for your contribution! Once your PR is merged, your contributions will be publicly visible on the relevant repository.
