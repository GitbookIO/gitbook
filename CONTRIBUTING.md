
# Contributing

Want to contribute to GitBook? That would be awesome!

- [Send feedback](#send-feedback)
- [Reporting Bugs](#reporting-bugs)
- [Asking Questions](#asking-questions)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Running Tests](#running-tests)

## Send feedback

We’ve done our best to test but your feedback is really important. If you encounter problems or have feedback about GitBook products (GitBook.com, GitBook Editor, or the Toolchain), please log an issue in the [GitbookIO/feedback](https://github.com/GitbookIO/feedback/issues) repository.


## Reporting Bugs

If you run into any weird behavior while using GitBook, feel free to open a new issue in this repository! To be most helpful, please include the steps to reproduce the bug as best you can, including the output of command `gitbook -V`.

## Asking Questions

Questions are very welcome :smile:! Previous questions that folks have asked are tagged with a [`question`](https://github.com/GitBookIO/gitbook/issues?q=is%3Aissue+is%3Aclosed+label%3Aquestion) label, so before opening a new issue double-check that someone hasn't asked it before. But if you don't see anything, or if you're not sure if it's the same, err on the side of asking!

We've also got a [GitBook Community Slack](https://slack.gitbook.com/) where you can ask questions and get answers from other people using GitBook.

## Submitting Pull Requests

All pull requests are super welcomed and greatly appreciated! Easy issues are marked with an [`easy-one`](https://github.com/GitBookIO/gitbook/issues?q=is%3Aopen+is%3Aissue+label%3Aeasy-one) label if you're looking for a simple place to get familiar with the code base.

Please include tests and docs with every pull request!

## Running Tests

To run the examples, you need to have the GitBook repository cloned to your computer. After that, you need to `cd` into the directory where you cloned it, and install the dependencies from `npm`.

```
npm install
```

Then you'll need to bootstrap it:

```
npm run bootstrap
```

Which will also compile the source files. Then run the tests with:

```
npm test
```
