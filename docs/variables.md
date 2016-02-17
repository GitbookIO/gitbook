# Variables

The following is a reference of the available data during book's parsing and theme generation.

### Global Variables

| Variable | Description |
| -------- | ----------- |
| `book` | Bookwide information + configuration settings from `book.json`. See below for details. |
| `gitbook` | GitBook specific information |
| `page` | Current page specific information |
| `file` | File associated with the current page specific information |
| `summary` | Information about the table of contents |

### Book Variables

| Variable | Description |
| -------- | ----------- |
| `book.title` | Title specified in the `book.json` (or detected from the README) |
| `book.description` | Description specified in the `book.json` (or detected from the README) |
| `book.[CONFIGURATION_DATA]` | All the `variables` set via the `book.json` are available through the book variable. |

### GitBook Variables

| Variable | Description |
| -------- | ----------- |
| `gitbook.time` | The current time (when you run the `gitbook` command). |
| `gitbook.version` | Version of GitBook used to generate the book |

### File Variables

| Variable | Description |
| -------- | ----------- |
| `file.path` | The path to the raw page |
| `file.mtime` | Modified Time, Time when file data last modified |

#### Page Variables

| Variable | Description |
| -------- | ----------- |
| `page.title` | Title of the page |
| `page.previous` | Previous page in the Table of Contents (can be `null`) |
| `page.next` | Next page in the Table of Contents (can be `null`) |

#### Table of Contents Variables

| Variable | Description |
| -------- | ----------- |
| `summary.parts` | List of sections in the Table of Contents |

Thw whole table of contents (`SUMMARY.md`) can be accessed:

`summary.parts[0].articles[0].title` will return the title of the first article.

