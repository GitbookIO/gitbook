# Release notes

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
