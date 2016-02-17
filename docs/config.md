# Configuration

GitBook allows you to customize your book using a flexible configuration. These options are specified in a `book.json` file.

### Configuration Settings

| Variable | Description |
| -------- | ----------- |
| `title` | Title of your book, default value is extracted from the README. On GitBook.com this field is pre-filled. |
| `description` | Description of your book, default value is extracted from the README. On GitBook.com this field is pre-filled. |
| `author` | Name of the author. On GitBook.com this field is pre-filled. |
| `isbn` | ISBN of the book |
| `language` | ISO code of the book's language, default value is `en` |
| `direction` | `rtl` or `ltr`, default value depends on the value of `language` |
| `gitbook` | [SemVer](http://semver.org) condition to validate which GitBook version should be used |
| `plugins` | List of plugins to load, See [the plugins section](#plugins) for more details |
| `pluginsConfig` |Configuration for plugins, See [the plugins section](#plugins) for more details |


### Plugins

Plugins and their configurations are specified in the `book.json`.

