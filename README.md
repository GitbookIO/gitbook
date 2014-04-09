GitBook
=======

[![Build Status](https://travis-ci.org/GitbookIO/gitbook.png?branch=master)](https://travis-ci.org/GitbookIO/gitbook)

GitBook is a command line tool (and Node.js library) for building beautiful programming books and exercises using GitHub/Git and Markdown. You can see an example: [Learn Javascript](http://gitbookio.github.io/javascript/).

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
-t, --title <name> Name of the book to generate, defaults to repo name
-i, --intro <intro> Description of the book to generate
-g, --github <repo_path> ID of github repo like : username/repo
-o, --output <directory>  Path to output directory, defaults to ./_book
-f, --format <name>       Change generation format, defaults to site, availables are: site, page, pdf, json
-i, --intro <intro>       Description of the book to generate
--githubHost <url>   The url of the github host (defaults to https://github.com/)
--theme <path>            Path to theme directory
```

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
