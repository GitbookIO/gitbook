GitBook
=======

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
```

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

Exercises need to start and finish with a separation bar (```---``` or ```***```). It should contain 3 code elements (**base**, **solution** and **validation**).

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
    
    ---
