var _ = require("lodash");
var Q = require("q");
var path = require("path");

var fs = require("./utils/fs");

var Configuration = function(book, options) {
	this.book = book;
    this.options = _.cloneDeep(Configuration.DEFAULT);
	this.options = _.merge(this.options, options || {});
};

// Read and parse the configuration
Configuration.prototype.load = function() {
	var that = this;

	return Q()
    .then(function() {
        try {
            var _config = require(path.resolve(that.book.root, that.options.configFile));
            that.options = _.merge(
            	that.options,
            	_.omit(_config, 'configFile', 'defaultsPlugins', 'generator', 'extension')
            );
        }
        catch(err) {
            return Q();
        }
    })
    .then(function() {
        that.options.output = that.options.output || path.join(that.book.root, "_book");
    });
};

// Get structure file
Configuration.prototype.getStructure = function(name) {
    return this.options.structure[name].split(".").slice(0, -1).join(".");
};

// Default configuration
Configuration.DEFAULT = {
    // Options that can't be extend
    "configFile": "book",
    "generator": "site",
    "extension": null,

    // Book metadats (somes are extracted from the README by default)
    "title": null,
    "description": null,
    "isbn": null,
    "lang": "en",

    // Structure
    "structure": {
        "langs": "LANGS.md",
        "readme": "README.md",
        "glossary": "GLOSSARY.md",
        "summary": "SUMMARY.md"
    },

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

module.exports= Configuration;
