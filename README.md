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
