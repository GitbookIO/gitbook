# Setup and Installation of GitBook

GitBook installation is an easy and straightforward process and it can be performed in a few minutes.

### Local Installation

##### Requirements

* NodeJS (v4.0.0 and above is recommended)
* Windows, Linux, Unix, or Mac OS X

##### Install with NPM

The best way to install GitBook is via **NPM**. At the terminal prompt, simply run the following command:

```
$ npm install gitbook-cli -g
```

`gitbook-cli` is an utility to install and use multiple versions of GitBook on the same system. It will automatically install the required version to build a book.

##### Create a book

Set up a boilerplate book in GitBook's root directory:

```
$ gitbook init
```

or in a new directory:

```
$ gitbook init ./directory
```

Preview and serve your book using:

```
$ gitbook serve
```

Or build a static website:

```
$ gitbook build
```

##### Install pre-releases

`gitbook-cli` makes it easy to download and install other versions of GitBook to test with your book:

```
$ gitbook fetch beta
```

Use `gitbook ls-remote` to list remote versions available for install.

##### Debugging

You can use the options `--log=debug` and `--debug` to get better error messages (with stack trace). For example:

```
$ gitbook build ./ --log=debug --debug
```