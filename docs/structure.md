# Directory Structure

{{ book.GB }} uses a simple directory structure, based on Markdown or Asciidoc files that are listed in the [SUMMARY](pages.md) and transformed into HTML afterwards. If you want to have multilingual content in your book, you should stick to a slightly [different structure](languages.md).

Initially, {{ book.GB }} consists of only two files: `README.md` and `SUMMARY.md`, whereas a general {{ book.GB }} project may look something like this:

```
.
├── book.json
├── README.md
├── SUMMARY.md
├── GLOSSARY.md
├── chapter-1/
|   ├── README.md
|   └── something.md
└── chapter-2/
    ├── README.md
    └── something.md
```

|     File      |   Type   | Description |
| --------------|:--------:| ----------- |
| `book.json`   | optional | Stores [configuration](config.md) data |
| `README.md`   | required | Preface / Introduction for your book |
| `SUMMARY.md`  | optional | Table of Contents (See [Pages](pages.md)) |
| `GLOSSARY.md` | optional | Lexicon / List of terms to annotate (See [Glossary](lexicon.md)) |

### Static files and images

A static file is a file that is not listed in the `SUMMARY.md`. All static files, unless [ignored](#ignore), are copied to the output.

### Ignoring files & folders {#ignore}

{{ book.GB }} will read the `.gitignore`, `.bookignore` and `.ignore` files to get a list of files and folders to skip.
The format inside those files, follows the same convention as `.gitignore`:

```
# This is a comment

# Ignore the file test.md
test.md

# Ignore everything in the directory "bin"
bin/*
```

### Project integration with subdirectory {#subdirectory}

For software projects, you can use a subdirectory (like `docs/`) to store the book for the project's documentation. You can configure the [`root` option](config.md) to indicate the folder where {{ book.GB }} can find the book's files:

```
.
├── book.json
└── docs/
    ├── README.md
    └── SUMMARY.md
```

With `book.json` containing:

```
{
    "root": "./docs"
}
```
