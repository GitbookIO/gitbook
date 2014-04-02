GitBook
=======

GiBook is a command line tool (and Node.js library) for building beautiful programming books and exercises using GitHub/Git and Markdown.

## How to use it:

GitBook can be installed from **NPM** using:

```
$ npm install gitbook -g
```

You can serve a repository as a book using:

```
$ gitbook serve ./repository
```

Or simply build the static website using:

```
$ gitbook build ./repository --output=./outputFolder
```

Options for commands `build` and `serve` are:

```
-t, --title <name> Name of the book to generate, defaults to repo name
-i, --intro <intro> Description of the book to generate
-g, --github <repo_path> ID of github repo like : username/repo
```

## Book Format

A book is a GitHub repository containing at least 2 files: `README.md` and `SUMMARY.md`.

#### SUMMARY.md

The SUMMARY.md is used for getting the complete summary of the book. It should contains a list of items (deep items are allowed) with links to the different pages.

Example:

```
# Summary

This is the summary of my book.

* [section 1](section1/README.md)
    * [example 1](section1/example1.md)
    * [example 2](section1/example2.md)
* [section 2](section2/README.md)
    * [example 1](section2/example1.md)
```

All the other content than the summary list will be ignored.

