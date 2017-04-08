# {{ book.GB }} FAQ

This page gathers common questions and answers concerning the {{ book.GB }} format and toolchain.

Questions about {{ book.GB }}.com and the Editor are gather into the [help.gitbook.com's FAQ](http://help.gitbook.com/faq.html).

#### How can I host/publish my book?

Books can easily be published and hosted on either [{{ book.GB }}.com](https://www.gitbook.com) or any static file hosting solution.

#### What can I use to edit my content?

Any text editor should work! However we advise using the [{{ book.GB }} Editor](https://www.gitbook.com/editor). [{{ book.GB }}.com](https://www.gitbook.com) also provides a web version of this editor.

#### Does {{ book.GB }} supports RTL/bi-directional text & languages?

Yes, {{ book.GB}} format supports right to left, and bi-directional writing. It automatically detects the direction in your pages (`rtl` or `ltr`) and adjusts the layout accordingly. The direction can also be specified globally in the configuration. To enable it, you either need to specify a language (ex: `ar`), or force {{ book.GB }} to use RTL in your [`book.json`](config.md):

```json
{
    "language": "ar",
    "direction": "rtl"
}
```

With version 3.0 of {{ book.GB }}, it's automatically detected according to the content.

_Note that, while the output book will indeed respect RTL, the Editor doesn't support RTL writing yet_.

#### Should I use an `.html` or `.md` extensions in my links?

You should always use paths and the `.md` extensions when linking to your files. {{ book.GB }} will automatically replace these paths with the appropriate links when the pointing files are referenced in the Table of Contents.

#### Can I create a {{ book.GB }} in a sub-directory of my repository?

Yes, {{ book.GB }}s can be created in [sub-directories](structure.md#subdirectory). {{ book.GB }}.com and the CLI also look in a series of [folders](structure.md) by default.

#### Does {{ book.GB }} support Math equations?

Yes, {{ book.GB }} supports math equations and TeX thanks to plugins. There are currently 2 official plugins to display math: [mathjax](https://plugins.gitbook.com/plugin/mathjax) and [katex](https://plugins.gitbook.com/plugin/katex).

#### Can I customize/theme the output?

Yes, both the website and ebook outputs can be customized using [themes](themes/README.md).

#### Can I add interactive content (videos, etc)?

Yes, you can extend your {{ book.GB }} with [plugins](plugins/README.md). You can use either [existing plugins](https://plugins.gitbook.com) or create your own!
