var Q = require('q');
var _ = require('lodash');
var path = require('path');

// Default configuration for gitbook
var CONFIG = {
    // Folders to use for output
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "output": null,

    // Generator to use for building
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "generator": "site",

    // Configuration file to use
    "configFile": "book",

    // Book metadats (somes are extracted from the README by default)
    "title": null,
    "description": null,
    "isbn": null,

    // For ebook format, the extension to use for generation (default is detected from output extension)
    // "epub", "pdf", "mobi"
    // Caution: it overrides the value from the command line
    // It's not advised this option in the book.json
    "extension": null,

    // Plugins list, can contain "-name" for removing default plugins
    "plugins": [],

    // Global configuration for plugins
    "pluginsConfig": {
        "fontSettings": {
            "theme": null, //"sepia", "night" or "white",
            "family": "sans",// "serif" or "sans",
            "size": 2 // 1 - 4
        }
    },

    // Variables for templating
    "variables": {},

    // Set another theme with your own layout
    // It's recommended to use plugins or add more options for default theme, though
    // See https://github.com/GitbookIO/gitbook/issues/209
    "theme": path.resolve(__dirname, '../../theme'),

    // Links in template (null: default, false: remove, string: new value)
    "links": {
        // Custom links at top of sidebar
        "sidebar": {
            //"Custom link name": "https://customlink.com"
        },

        // Sharing links
        "sharing": {
            "google": null,
            "facebook": null,
            "twitter": null,
            "weibo": null,
            "all": null
        }
    },


    // Options for PDF generation
    "pdf": {
        // Add toc at the end of the file
        "toc": true,

        // Add page numbers to the bottom of every page
        "pageNumbers": false,

        // Font size for the file content
        "fontSize": 12,

        // Paper size for the pdf
        // Choices are [u’a0’, u’a1’, u’a2’, u’a3’, u’a4’, u’a5’, u’a6’, u’b0’, u’b1’, u’b2’, u’b3’, u’b4’, u’b5’, u’b6’, u’legal’, u’letter’]
        "paperSize": "a4",

        // Margin (in pts)
        // Note: 72 pts equals 1 inch
        "margin": {
            "right": 62,
            "left": 62,
            "top": 36,
            "bottom": 36
        },

        //Header HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "headerTemplate": "",

        //Footer HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "footerTemplate": ""
    }
};

// Return complete configuration
var defaultsConfig = function(options) {
    return _.merge(options || {}, CONFIG, _.defaults);
};

// Read configuration from book.json
var readConfig = function(options) {
    options = defaultsConfig(options);

    return Q()
    .then(function() {
        try {
            var _config = require(path.resolve(options.input, options.configFile));
            options = _.merge(options, _.omit(_config, 'input', 'configFile', 'defaultsPlugins', 'generator'));
        }
        catch(err) {
            // No config file: not a big deal
            return Q();
        }
    })
    .thenResolve(options);
};

module.exports = {
    CONFIG: CONFIG,
    defaults: defaultsConfig,
    read: readConfig
}

