# Variables

The following is a reference of the available data during book's parsing and theme generation.

### Global Variables

| Variable | Description |
| -------- | ----------- |
| `book` | Bookwide information + configuration settings from `book.json`. See below for details. |
| `gitbook` | GitBook specific information |
| `page` | Current page specific information |
| `file` | File associated with the current page specific information |

### Book Variables

| Variable | Description |
| -------- | ----------- |
| `book.[CONFIGURATION_DATA]` | All the `variables` set via the `book.json` are available through the book variable. |

### GitBook Variables

| Variable | Description |
| -------- | ----------- |
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




