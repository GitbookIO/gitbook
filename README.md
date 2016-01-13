GitBook
=======

[![NPM version](https://badge.fury.io/js/gitbook.svg)](http://badge.fury.io/js/gitbook)
[![Linux Build Status](https://travis-ci.org/GitbookIO/gitbook.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/63nlflxcwmb2pue6?svg=true)](https://ci.appveyor.com/project/GitBook/gitbook)
[![Slack Status](https://slack.gitbook.com/badge.svg)](https://slack.gitbook.com)

GitBook is a command line tool (and Node.js library) for building beautiful books using GitHub/Git and Markdown (or AsciiDoc). Here is an example: [Learn Javascript](https://www.gitbook.com/book/GitBookIO/javascript).

You can publish and host books easily online using [gitbook.com](https://www.gitbook.com). A desktop editor is [also available](https://www.gitbook.com/editor).

Check out the [GitBook Community Slack Channel](https://slack.gitbook.com), Stay updated by following [@GitBookIO](https://twitter.com/GitBookIO) on Twitter or [GitBook](https://www.facebook.com/gitbookcom) on Facebook.

Complete documentation is available at [help.gitbook.com](http://help.gitbook.com/).

![Image](https://raw.github.com/GitbookIO/gitbook/master/preview.png)

## How to use it:

GitBook can be installed from **NPM** using:

```
$ npm install gitbook-cli -g
```

Create the directories and files for a book from its [SUMMARY.md](https://github.com/GitbookIO/gitbook#book-format) file (if existing) using

```
$ gitbook init
```

You can serve a repository as a book using:

```
$ gitbook serve
```

Or simply build the static website using:

```
$ gitbook build
```

## Features

* [Output as a website or ebook (pdf, epub, mobi)](http://help.gitbook.com/format/output.html)
* [Multi-Languages](http://help.gitbook.com/format/languages.html)
* [Glossary](http://help.gitbook.com/format/glossary.html)
* [Cover](http://help.gitbook.com/format/cover.html)
* [AsciiDoc Support](http://help.gitbook.com/format/asciidoc.html)
* [Variables and Templating](http://help.gitbook.com/format/templating.html)
* [Content References](http://help.gitbook.com/format/conrefs.html)
* [Plugins](http://help.gitbook.com/format/plugins.html)
* Interractive reader website:
    * Search
    * Font Settings (Serif, Sans Serif)
    * Themes: white, sepia, night

## Output Formats

GitBook can generate your book in the following formats:

* **Static Website**: This is the default format. It generates a complete interactive static website that can be, for example, hosted on GitHub Pages.
* **eBook**: You need to have [ebook-convert](http://manual.calibre-ebook.com/cli/ebook-convert.html) installed.  You can specify the eBook filename as the second argument, otherwise `book` will be used.
  * Generate a **PDF** using:  `gitbook pdf ./myrepo ./mybook.pdf`
  * Generate a **ePub** using: `gitbook epub ./myrepo ./mybook.epub`
  * Generate a **MOBI** using: `gitbook mobi ./myrepo ./mybook.mobi`
* **JSON**: This format is used for debugging or extracting metadata from a book. Generate this format using: ```gitbook build ./myrepo --format=json```.

## Book Format

A book is a Git repository containing at least 2 files: `README.md` and `SUMMARY.md`.

#### README.md

Typically, this should be the introduction for your book. It will be automatically added to the final summary.

#### SUMMARY.md

The `SUMMARY.md` defines your book's structure. It should contain a list of chapters, linking to their respective pages.

Example:

```markdown
# Summary

This is the summary of my book.

* [section 1](section1/README.md)
    * [example 1](section1/example1.md)
    * [example 2](section1/example2.md)
* [section 2](section2/README.md)
    * [example 1](section2/example1.md)
```

Files that are not included in `SUMMARY.md` will not be processed by `gitbook`.

#### Multi-Languages

GitBook supports building books written in multiple languages. Each language should be a sub-directory following the normal GitBook format, and a file named `LANGS.md` should be present at the root of the repository with the following format:

```markdown
* [English](en/)
* [French](fr/)
* [Español](es/)
```

You can see a complete example with the [Learn Git](https://github.com/GitbookIO/git) book.

#### Glossary

Allows you to specify terms and their respective definitions to be displayed in the glossary. Based on those terms, `gitbook` will automatically build an index and highlight those terms in pages.

The `GLOSSARY.md` format is very simple :

```markdown
# term
Definition for this term

# Another term
With it's definition, this can contain bold text and all other kinds of inline markup ...
```

#### Variables and Templating

A set of variables can be defined in the `book.json`:

```js
{
    "variables": {
        "host": "mybook.com"
    }
}
```

These variables can be used in the markdown files:

```
The host is {{ book.host }}
```

You can also use condition with these variables:

```
{% if book.host == "mybook.com" %}

{% else %}

{% endif %}
```

Variables of `book.json` are available in the `book` namespace. You can also access informations about the `file` itself and the `gitbook` version:

```
My file is {{ file.path }}
Modified at {{ file.mtime }}
Book built with GitBook {{ gitbook.version }}
```

#### Content References

You can use "content references," or conrefs, when writing books or documentation using GitBook.

Include a file from the same book:

```
{% include "./test.md" %}
```

or from a git repository (with a specific revision):

```
{% include "git+https://github.com/GitbookIO/documentation.git/README.md#1.0.1" %}
```

Includes can be used with variables (see [Variables and Templating](#variables-and-templating)):

```
{% include book.ref_doc_readme %}
```

#### Ignoring files & folders

GitBook will read the `.gitignore`, `.bookignore` and `.ignore` files to get a list of files and folders to skip. (The format inside those files follows the same convention as `.gitignore`).

Best practices for the `.gitignore` is to ignore build files from **node.js** (`node_modules`, ...) and build files from GitBook: `_book`, `*.epub`, `*.mobi` and `*.pdf` ([Download GitBook.gitignore](https://github.com/github/gitignore/blob/master/GitBook.gitignore)).

#### Cover

A cover image can be set by creating a file: **/cover.jpg**.
The best resolution is **1800x2360**. The generation of the cover can be done automatically using the plugin [autocover](https://github.com/GitbookIO/plugin-autocover).

A small version of the cover can also be set by creating a file: **/cover_small.jpg**.

#### AsciiDoc

Since version 2.0.0, AsciiDoc can be used instead of Markdown, simply replace the `.md` by the `.adoc` extension. Chapters in the summary are detected from an ordered list in the `SUMMARY.adoc`.

## Publish your book

The platform [GitBook.com](https://www.gitbook.com/) is like an "Heroku for books": you can create a book on it (public, paid, or private) and update it using **git push**.

## Plugins

Plugins can be used to extend your book's functionality. Read [GitbookIO/plugin](https://github.com/GitbookIO/plugin) for more information about how to build a plugin for GitBook.

Plugins needed to build a book can be installed using: `gitbook install ./`. You can find plugins at [plugins.gitbook.com](http://plugins.gitbook.com).


## Debugging

You can use the options `--log=debug` and `--debug` to get better error messages (with stack trace). For example:

```
$ gitbook build ./ --log=debug --debug
```

#### How to use the latest commit from GitBook in gitbook-cli

To use the latest commit from `GitBook/gitbook` with `gitbook-cli`:

```
$ git clone https://github.com/GitbookIO/gitbook.git ./gitbook
$ gitbook versions:link ./gitbook
```

Now `gitbook-cli` will be using the `./gitbook` folder.

You can uninstall it using: `gitbook versions:uninstall latest`.
