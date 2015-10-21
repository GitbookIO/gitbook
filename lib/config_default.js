var path = require('path');

module.exports = {
    // Options that can't be extend
    'configFile': 'book',
    'generator': 'website',
    'extension': null,

    // Book metadats (somes are extracted from the README by default)
    'title': null,
    'description': null,
    'isbn': null,
    'language': 'en',
    'direction': null,
    'author': null,

    // version of gitbook to use
    'gitbook': '*',

    // Structure
    'structure': {
        'langs': 'LANGS.md',
        'readme': 'README.md',
        'glossary': 'GLOSSARY.md',
        'summary': 'SUMMARY.md'
    },

    // CSS Styles
    'styles': {
        'website': 'styles/website.css',
        'print': 'styles/print.css',
        'ebook': 'styles/ebook.css',
        'pdf': 'styles/pdf.css',
        'mobi': 'styles/mobi.css',
        'epub': 'styles/epub.css'
    },

    // Plugins list, can contain '-name' for removing default plugins
    'plugins': [],

    // Global configuration for plugins
    'pluginsConfig': {},

    // Variables for templating
    'variables': {},

    // Set another theme with your own layout
    // It's recommended to use plugins or add more options for default theme, though
    // See https://github.com/GitbookIO/gitbook/issues/209
    'theme': path.resolve(__dirname, '../theme'),

    // Links in template (null: default, false: remove, string: new value)
    'links': {
        // Custom links at top of sidebar
        'sidebar': {
            // 'Custom link name': 'https://customlink.com'
        },

        // Sharing links
        'sharing': {
            'google': null,
            'facebook': null,
            'twitter': null,
            'weibo': null,
            'all': null
        }
    },


    // Options for PDF generation
    'pdf': {
        // Add toc at the end of the file
        'toc': true,

        // Add page numbers to the bottom of every page
        'pageNumbers': false,

        // Font for the file content
        'fontSize': 12,
        'fontFamily': 'Arial',

        // Paper size for the pdf
        // Choices are [u’a0’, u’a1’, u’a2’, u’a3’, u’a4’, u’a5’, u’a6’, u’b0’, u’b1’, u’b2’, u’b3’, u’b4’, u’b5’, u’b6’, u’legal’, u’letter’]
        'paperSize': 'a4',

        // How to mark detected chapters.
        // Choices are “pagebreak”, “rule”, 'both' or “none”.
        'chapterMark' : 'pagebreak',

        // An XPath expression. Page breaks are inserted before the specified elements.
        // To disable use the expression: '/'
        'pageBreaksBefore': '/',

        // Margin (in pts)
        // Note: 72 pts equals 1 inch
        'margin': {
            'right': 62,
            'left': 62,
            'top': 56,
            'bottom': 56
        },

        // Header HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        'headerTemplate': null,

        // Footer HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        'footerTemplate': null
    }
};
