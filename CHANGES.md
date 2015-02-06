# Release notes

## 2.0.0-alpha.6
- Add es and pt translations
- Fix replacement of glossary terms

## 2.0.0-alpha.5
- Fix copy of files/covers
- Add back `finish:before` hook

## 2.0.0-alpha.4
- Fix copy of cover for multilingal books

## 2.0.0-alpha.3
- Norwegian translation
- Load plugins from book in priority

## 2.0.0-alpha.3
- Fix init command
- Update parsers to fix spaces in summary (`gitbook-parsers@0.3.1`)

## 2.0.0-alpha.1
- Externalize parsing into `gitbook-parsers` module
- Supports AsciiDoc and reStructuredText
- Hooks for page (`page:*`) are now deprecated, plugins should extend filters and blocks instead
- Hooks `summary` and `glossary` (after and before) have been removed
- Exercises and Quizzes are no longer parsed in the markdown parser
- Support for more markdown extensions: `.markdown`, `.mdown`
- Templates are rendered with nunjucks instead of swig, syntax is almost compatible, there is some changes with contexts and filters. `{{ super() }}` should be use instead of `{% parent %}`
- Clean output folder on build without removing `.git` and `.svn`
- MathJAX is no longer a default plugin
- SVG images are converted to PNG during generation of ebooks
- i18n in website and ebook (ru, it, de, fr)
- New templating syntax
- Content references (both internal and external)
- Glossary terms are handled during generation (also in ebook format)

## 1.5.0
- Fix `serve` command, broken by `1.4.2`
- Add nicer `dark` theme :)

## 1.4.2
- Force `process.exit` after builds, to prevent (possibly) lingering plugins

## 1.4.1
- Fix command 'install' without arguments

## 1.4.0
- Add command `gitbook install` to install plugins from book.json
- `package.json` is no longer necessary

## 1.3.4
- Add glossary to ebooks
- Fix autocover with new hook "finish:before"
- Add X-UA-Compatible meta tag for IE

## 1.3.3
- Fix parsing of lexed content using the client library

## 1.3.2
- ePub files are now passing validation from epubcheck
- Fix replacement of multiple glossary terms in a single sentence
- Fix on windows deep relative links
- Fix search indexer

## 1.3.1
- Fix error with links in markdown

## 1.3.0
- Bundle gitbook parsing library as a client side library in `gitbook.js` and `gitbook.min.js`

## 1.2.0
- Improvements on ebook generation
- Fix incorrect follow of links in ebook generation
- Move Table of Contents at the beginning of the ebook
- Update to last highlight.js (includes Swift)
- Includes of templates and variables (from book.json)

## 1.1.1
- Rewrite quiz logic to be more robust
- Improve integration of glossary
- Improve generation of ebook by using a multiple HTML pages input source
- Fix incorrect page breaks after h1 and h2 divs
- New options to set header and footer in PDF generation

## 1.1.0
- Plugins can now extend the ebook generation (pdf, epub, mobi)
- Update `kramed` to version 0.4.3

## 1.0.3
- Update `mathjax` plugin and MathJAx to version 2.4
- Update `highlight.js` to 8.2.0

## 1.0.2
- Update `mathjax` plugin, fixes issues with inline math rendering (no longer wanted)

## 1.0.1
- New inline math convention (kramdown's), using `$$` rather than `$` as delimiters
- Fix instapaper sharing
- The `exercises` & `quizzes` plugins are now by default

## 1.0.0
- New design
- Support for glossary
- Support for sharing to instapaper
- Support for footnotes

## 0.7.1
- Update `fs-extra` to `0.10.0` (fixes potential race conditions)

## 0.7.0
- Add page break in ebook (pdf, epub, mobi) between chapters/articles
- Start using kramed instead of marked
- Fix display of inline math
- Switch to graceful-fs to fix EMFILE errors
- Add sharing to weibo.com

## 0.6.2
- Support generating a plugin's book info dynamically
- Improve navigation on dark theme
- Improve path normalization when parsing SUMMARY.md

## 0.6.0
- Generate header id the same as github
- Custom links can be added at top of sidebar
- Summary can now be transformed by plugins
- Support importing code snippets
