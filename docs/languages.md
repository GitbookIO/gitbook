# Multilingual books

{{ book.GB }} supports multilingual books out-of-the-box. All files that belong to a particular language should be placed in a sub-directory, following the normal {{ book.GB }} format, whereas a `LANGS.md` file should be placed in the root directory of your project.

`LANGS.md` format:

```markdown
# Languages

* [English](en/)
* [French](fr/)
* [Español](es/)
```

### Configuration for each language

Each language book (e.g. `en`) can have a separate `book.json` file, that will extend the main configuration. Coinciding configuration options (if any) will be overridden by the main `book.json` file. 

The only exception is that plugins can only be defined globally in the main `book.json` file, so all language specific plugins and their configurations are ignored.
