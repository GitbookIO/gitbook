GitBook
=======

[![Build Status](https://travis-ci.org/GitbookIO/gitbook.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook)

GitBook is a command line tool (and Node.js library) for building beautiful programming books and exercises using GitHub/Git and Markdown. You can see an example: [Learn Javascript](http://gitbookio.github.io/javascript/). An [editor](https://github.com/GitbookIO/editor) is available for Windows, Mac and Linux. You can follow [@GitBookIO](https://twitter.com/GitBookIO) on Twitter.

![Image](https://raw.github.com/GitbookIO/gitbook/master/preview.png)

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
-o, --output <directory>  Path to output directory, defaults to ./_book
-f, --format <name>       Change generation format, defaults to site, availables are: site, page, pdf, json
--config <config file>    Configuration file to use, defaults to book.json
```

GitBook load the default configuration from a `book.json` file in the repository if it exists.

Here are the options that can be stored in this file:

```
{
    // Folders to use for output (caution: it override the value from the command line)
    "output": null,

    // Generator to use for building (caution: it override the value from the command line)
    "generator": "site",

    // Book title and description (defaults are extracted from the README)
    "title": null,
    "description": null,

    // GitHub informations (defaults are extracted using git)
    "github": null,
    "githubHost": "https://github.com/",

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

    // set another theme with your own layout
    // it's recommended to use plugins or add more options for default theme, though
    // see https://github.com/GitbookIO/gitbook/issues/209
    "theme": "./localtheme",

    // Links in template (null: default, false: remove, string: new value)
    "links": {
        // Link to home in the top-left corner
        "home": null,

        // Links in top of sidebar
        "about": null,
        "issues": null,
        "contribute": null,

        // Sharing links
        "sharing": {
            "google": null,
            "facebook": null,
            "twitter": null
        },

        // Contribute links
        "contribute": {
            "watch" : null,
            "star": null
        }
    }
}
```

You can publish your books to our index by visiting [GitBook.io](http://www.gitbook.io)

## Output Formats

GitBook can generate your book in the following formats:

* **Static Website**: This is the default format, it generates a complete interactive static website that can be for example hosted on GitHub Pages.
* **PDF**: A complete PDF book with exercise solutions at the end of the book. Generate to this format using: ```gitbook pdf ./myrepo```, you need to have [gitbook-pdf](https://github.com/GitbookIO/gitbook-pdf) installed.
* **eBook**: A complete eBook with exercise solutions at the end of the book. Generate to this format using: ```gitbook ebook ./myrepo```, you need to have [ebook-convert](http://manual.calibre-ebook.com/cli/ebook-convert.html) installed.
* **Single Page**: The book will be stored in a single printable HTML page, this format is used for conversion to PDF or eBook. Generate to this format using: ```gitbook build ./myrepo -f page```.
* **JSON**: This format is used for debugging or extracting metadata from a book. Generate to this format using: ```gitbook build ./myrepo -f json```.

## Book Format

A book is a GitHub repository containing at least 2 files: `README.md` and `SUMMARY.md`.

#### README.md

As usual, it should contains an introduction for your book. It will be automatically added to the final summary.

#### SUMMARY.md

The `SUMMARY.md` defines your book's structure. It should contain a list of chapters, linking to their respective pages.

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

Files that are not included in the `SUMMARY.md` will not be processed by `gitbook`.

#### Exercises

A book can contain interactive exercises (currently only in Javascript but Python and Ruby are coming soon ;) ). An exercise is a code challenge provided to the reader, which is given a code editor to write a solution which is checked against the book author's validation code.

An exercise is defined by 4 simple parts:

* Exercise **Message**/Goals (in markdown/text)
* **Initial** code to show to the user, providing a starting point
* **Solution** code, being a correct solution to the exercise
* **Validation** code that tests the correctness of the user's input

Exercises need to start and finish with a separation bar (```---``` or ```***```). It should contain 3 code elements (**base**, **solution** and **validation**). It can contain a 4th element that provides **context** code (functions, imports of libraries etc ... that shouldn't be displayed to the user).

    ---

    Define a variable `x` equal to 10.

    ```js
    var x =
    ```

    ```js
    var x = 10;
    ```

    ```js
    assert(x == 10);
    ```

    ```js
    // This is context code available everywhere
    // The user will be able to call magicFunc in his code
    function magicFunc() {
        return 3;
    }
    ```

    ---

#### Multi-Languages

GitBook supports building books written in multiple languages. Each language should be a sub-directory following the normal GitBook format, and a file named `LANGS.md` should be present at the root of the repository with the following format:

```
* [English](en/)
* [French](fr/)
* [Español](es/)
```

You can see a complete example with the [Learn Git](https://github.com/GitbookIO/git) book.

#### Ignoring files & folders

GitBook will read the `.gitignore`, `.bookignore` and `.ignore` files to get a list of files and folders to skip. (The format inside those files, follows the same convention as `.gitignore`)

#### Cover

A cover image can be set by creating a file: **/cover.jpg** or **cover.png**.
The best resolution is **1600x2400**. The generation of the cover can be done automatically using the plugin [autocover](https://github.com/GitbookIO/plugin-autocover).

#### Plugins

Plugins can used to extend your book's functionality. Read [GitbookIO/plugin](https://github.com/GitbookIO/plugin) for more information about how to build a plugin for gitbook.

##### Default plugins:

* [mathjax](https://github.com/GitbookIO/plugin-mathjax): displays mathematical notation in the book.
* [mixpanel](https://github.com/GitbookIO/plugin-mixpanel): Mixpanel tracking for your book

##### Other plugins:

* [Google Analytics](https://github.com/GitbookIO/plugin-ga): Google Analytics tracking for your book
* [Disqus](https://github.com/GitbookIO/plugin-disqus): Disqus comments integration in your book
* [Autocover](https://github.com/GitbookIO/plugin-autocover): Generate a cover for your book
* [Transform annoted quotes to notes](https://github.com/erixtekila/gitbook-plugin-richquotes): Allow extra markdown markup to render blockquotes as nice notes
* [Send code to console](https://github.com/erixtekila/gitbook-plugin-toconsole): Evaluate javascript blockin the browser inspector's console
* [Revealable sections](https://github.com/mrpotes/gitbook-plugin-reveal): Reveal sections of the page using buttons made from the first title in each section
* [Markdown within HTML](https://github.com/mrpotes/gitbook-plugin-nestedmd): Process markdown within HTML blocks - allows custom layout options for individual pages
* [Bootstrap JavaScript plugins](https://github.com/mrpotes/gitbook-plugin-bootstrapjs): Use the [Bootstrap JavaScript plugins](http://getbootstrap.com/javascript) in your online GitBook
