GitBook
=======

[![Build Status](https://travis-ci.org/GitbookIO/gitbook.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook)
[![NPM version](https://badge.fury.io/js/gitbook.svg)](http://badge.fury.io/js/gitbook)

GitBook is a command line tool (and Node.js library) for building beautiful books using GitHub/Git and Markdown. Here is an example: [Learn Javascript](https://www.gitbook.io/book/GitBookIO/javascript). You can publish book easily online using [gitbook.io](https://www.gitbook.io) and an [editor](https://github.com/GitbookIO/editor) is available for Windows, Mac and Linux. You can follow [@GitBookIO](https://twitter.com/GitBookIO) on Twitter. Complete documentation is available at [help.gitbook.io](http://help.gitbook.io/).

![Image](https://raw.github.com/GitbookIO/gitbook/master/preview.png)

## How to use it:

GitBook can be installed from **NPM** using:

```
$ npm install gitbook -g
```

Create the directories and files for a book from its [SUMMARY.md](https://github.com/GitbookIO/gitbook#book-format) file using 
```
$ gitbook init
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
-o, --output <directory>  Path to output directory, defaults to ./_book
-f, --format <name>       Change generation format, defaults to site, availables are: site, page, ebook, json
--config <config file>    Configuration file to use, defaults to book.js or book.json
```

GitBook loads the default configuration from a `book.json` file in the repository if it exists.

Here are the options that can be stored in this file:

```js
{
    // Folders to use for output
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "output": null,

    // Generator to use for building
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "generator": "site",

    // Book metadats (somes are extracted from the README by default)
    "title": null,
    "description": null,
    "isbn": null,

    // For ebook format, the extension to use for generation (default is detected from output extension)
    // "epub", "pdf", "mobi"
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "extension": null,

    // Plugins list, can contain "-name" for removing default plugins
    "plugins": [],

    // Global configuration for plugins
    "pluginsConfig": {
        "fontSettings": {
            "theme": "sepia", "night" or "white",
            "family": "serif" or "sans",
            "size": 1 to 4
        }
    },

    // Variables for templating
    "variables": {},

    // Links in template (null: default, false: remove, string: new value)
    "links": {
    	// Custom links at top of sidebar
    	"sidebar": {
    	    "Custom link name": "https://customlink.com"
    	},

        // Sharing links
        "sharing": {
            "google": null,
            "facebook": null,
            "twitter": null,
            "weibo": null,
            "all": null
        }
    },


    // Options for PDF generation
    "pdf": {
        // Add page numbers to the bottom of every page
        "pageNumbers": false,

        // Font size for the fiel content
        "fontSize": 12,

        // Paper size for the pdf
        // Choices are [u’a0’, u’a1’, u’a2’, u’a3’, u’a4’, u’a5’, u’a6’, u’b0’, u’b1’, u’b2’, u’b3’, u’b4’, u’b5’, u’b6’, u’legal’, u’letter’]
        "paperSize": "a4",

        // Margin (in pts)
        // Note: 72 pts equals 1 inch
        "margin": {
            "right": 62,
            "left": 62,
            "top": 36,
            "bottom": 36
        },

        //Header HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "headerTemplate": null,

        //Footer HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "footerTemplate": null
    }
}
```

You can publish your books to our index by visiting [GitBook.io](http://www.gitbook.io)

## Output Formats

GitBook can generate your book in the following formats:

* **Static Website**: This is the default format. It generates a complete interactive static website that can be, for example, hosted on GitHub Pages.
* **eBook**: A complete eBook with exercise solutions at the end of the book.  You need to have [ebook-convert](http://manual.calibre-ebook.com/cli/ebook-convert.html) installed.  You can specify the eBook filename with the `-o` option, otherwise `book` will be used.
  * Generate a **PDF** using:  `gitbook pdf ./myrepo`
  * Generate a **ePub** using: `gitbook epub ./myrepo`
  * Generate a **MOBI** using: `gitbook mobi ./myrepo`
* **JSON**: This format is used for debugging or extracting metadata from a book. Generate this format using: ```gitbook build ./myrepo -f json```.

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

#### Ignoring files & folders

GitBook will read the `.gitignore`, `.bookignore` and `.ignore` files to get a list of files and folders to skip. (The format inside those files follows the same convention as `.gitignore`).

Best practices for the `.gitignore` is to ignore build files from **node.js** (`node_modules`, ...) and build files from GitBook: `_book`, `*.epub`, `*.mobi` and `*.pdf` ([Download GitBook.gitignore](https://github.com/github/gitignore/blob/master/GitBook.gitignore)).

#### Cover

A cover image can be set by creating a file: **/cover.jpg**.
The best resolution is **1800x2360**. The generation of the cover can be done automatically using the plugin [autocover](https://github.com/GitbookIO/plugin-autocover).

A small version of the cover can also be set by creating a file: **/cover_small.jpg**.

#### Publish your book

The platform [GitBook.io](https://www.gitbook.io/) is like an "Heroku for books": you can create a book on it (public, paid, or private) and update it using **git push**.

#### Plugins

Plugins can be used to extend your book's functionality. Read [GitbookIO/plugin](https://github.com/GitbookIO/plugin) for more information about how to build a plugin for GitBook.

Plugins needed to build a book can be installed using: `gitbook install ./`.

##### Official plugins:

| Name | Description |
| ----- | ---- |
| [exercises](https://github.com/GitbookIO/plugin-exercises) | Add interactive exercises to your book. |
| [quizzes](https://github.com/GitbookIO/plugin-quizzes) | Add interactive quizzes to your book. |
| [mathjax](https://github.com/GitbookIO/plugin-mathjax) | Displays mathematical notation in the book. |
| [mixpanel](https://github.com/GitbookIO/plugin-mixpanel) | Mixpanel tracking for your book |
| [infinitescroll](https://github.com/GitbookIO/gitbook-plugin-infinitescroll) | Infinite Scrolling |

##### Other plugins:

| Name | Description |
| ----- | ---- |
| [Google Analytics](https://github.com/GitbookIO/plugin-ga) | Google Analytics tracking for your book |
| [Disqus](https://github.com/GitbookIO/plugin-disqus) | Disqus comments integration in your book |
| [Autocover](https://github.com/GitbookIO/plugin-autocover) | Generate a cover for your book |
| [Transform annoted quotes to notes](https://github.com/erixtekila/gitbook-plugin-richquotes) | Allow extra markdown markup to render blockquotes as nice notes |
| [Send code to console](https://github.com/erixtekila/gitbook-plugin-toconsole) | Evaluate javascript block in the browser inspector's console |
| [Revealable sections](https://github.com/mrpotes/gitbook-plugin-reveal) | Reveal sections of the page using buttons made from the first title in each section |
| [Markdown within HTML](https://github.com/mrpotes/gitbook-plugin-nestedmd) | Process markdown within HTML blocks - allows custom layout options for individual pages |
| [Bootstrap JavaScript plugins](https://github.com/mrpotes/gitbook-plugin-bootstrapjs) | Use the [Bootstrap JavaScript plugins](http://getbootstrap.com/javascript) in your online GitBook |
| [Piwik Open Analytics](https://github.com/emmanuel-keller/gitbook-plugin-piwik) | Piwik Open Analytics tracking for your book |
| [Heading Anchors](https://github.com/rlmv/gitbook-plugin-anchors) | Add linkable Github-style anchors to headings |
| [JSBin](https://github.com/jcouyang/gitbook-plugin-jsbin) | Embedded jsbin frame into your book |
| [gitbook-grvis](https://github.com/romanlytkin/gitbook-grvis) | Gitbook GrViz plugin is used to select from markdown dot and converting it into a picture format svg |
| [gitbook-plantuml](https://github.com/romanlytkin/gitbook-plantuml) | Gitbook PlantUml plugin is used to select from markdown uml and converting it into a picture format svg |
| [gitbook-mermaid](https://github.com/JozoVilcek/gitbook-mermaid-plugin) | Adds diagrams and flowcharts rendered by [mermaid](https://github.com/knsv/mermaid) |

#### Debugging

You can use the environment variable `DEBUG=true` to get better error messages (with stack trace). For example:

```
$ export DEBUG=true
$ gitbook build ./
```
