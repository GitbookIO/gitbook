var _ = require("lodash");
var Q = require("q");
var path = require("path");
var semver = require("semver");

var pkg = require("../package.json");
var i18n = require("./utils/i18n");

// Default plugins added to each books
var defaultsPlugins = ["highlight"];

// Normalize a list of plugins to use
function normalizePluginsList(plugins) {
    // Normalize list to an array
    plugins = _.isString(plugins) ? plugins.split(",") : (plugins || []);

    // Remove empty parts
    plugins = _.compact(plugins);

    // Divide as {name, version} to handle format like "myplugin@1.0.0"
    plugins = _.map(plugins, function(plugin) {
        if (plugin.name) return plugin;

        var parts = plugin.split("@");
        return {
            "name": parts[0],
            "version": parts[1] // optional
        };
    });

    // List plugins to remove
    var toremove = _.chain(plugins)
    .filter(function(plugin) {
        return plugin.name.length > 0 && plugin.name[0] == "-";
    })
    .map(function(plugin) {
        return plugin.name.slice(1);
    })
    .value();

    // Merge with defaults
    plugins = _.chain(plugins)
    .concat(_.map(defaultsPlugins, function(plugin) {
        return { "name": plugin };
    }))
    .uniq()
    .value();

    // Build final list
    plugins = _.filter(plugins, function(plugin) {
        return !_.contains(toremove, plugin.name) && !(plugin.name.length > 0 && plugin.name[0] == "-");
    });

    return plugins;
}

var Configuration = function(book, options) {
    var that = this;

    this.book = book;

    this.options = _.cloneDeep(Configuration.DEFAULT);
    this.options = _.merge(this.options, options || {});

    // options.input == book.root
    Object.defineProperty(this.options, "input", {
        get: function () {
            return that.book.root;
        }
    });

    // options.originalInput == book.parent.root
    Object.defineProperty(this.options, "originalInput", {
        get: function () {
            return that.book.parent? that.book.parent.root : undefined;
        }
    });

    // options.originalOutput == book.parent.options.output
    Object.defineProperty(this.options, "originalOutput", {
        get: function () {
            return that.book.parent? that.book.parent.options.output : undefined;
        }
    });
};

// Read and parse the configuration
Configuration.prototype.load = function() {
    var that = this;

    return Q()
    .then(function() {
        var configPath, _config;

        try {
            configPath = require.resolve(
                that.book.resolve(that.options.configFile)
            );

            // Invalidate node.js cache for livreloading
            delete require.cache[configPath];

            _config = require(configPath);
            that.options = _.merge(
                that.options,
                _.omit(_config, "configFile", "defaultsPlugins", "generator", "extension")
            );
        }
        catch(err) {
            if (err instanceof SyntaxError) return Q.reject(err);
            return Q();
        }
    })
    .then(function() {
        if (!semver.satisfies(pkg.version, that.options.gitbook)) {
            throw "GitBook version doesn't satisfy version required by the book: "+that.options.gitbook;
        }
        if (that.options.gitbook != "*" && !semver.satisfies(semver.inc(pkg.version, "patch"), that.options.gitbook)) {
            that.book.log.warn.ln("gitbook version specified in your book.json might be too strict for future patches, \""+(_.first(pkg.version.split("."))+".x.x")+"\" is more adequate");
        }

        that.options.output = path.resolve(that.options.output || that.book.resolve("_book"));
        that.options.plugins = normalizePluginsList(that.options.plugins);
        that.options.defaultsPlugins = normalizePluginsList(that.options.defaultsPlugins || "");
        that.options.plugins = _.union(that.options.plugins, that.options.defaultsPlugins);
        that.options.plugins = _.uniq(that.options.plugins, "name");

        // Default value for text direction (from language)
        if (!that.options.direction) {
            var lang = i18n.getCatalog(that.options.language);
            if (lang) that.options.direction = lang.direction;
        }

        that.options.gitbook = pkg.version;
    });
};

// Extend the configuration
Configuration.prototype.extend = function(options) {
    _.extend(this.options, options);
};

// Get structure file
Configuration.prototype.getStructure = function(name) {
    return this.options.structure[name].split(".").slice(0, -1).join(".");
};

// Return normalized language
Configuration.prototype.normalizeLanguage = function() {
    return i18n.normalizeLanguage(this.options.language);
};

// Return a configuration
Configuration.prototype.get = function(key, def) {
    return _.get(this.options, key, def);
};

// Default configuration
Configuration.DEFAULT = {
    // Options that can"t be extend
    "configFile": "book",
    "generator": "website",
    "extension": null,

    // Book metadats (somes are extracted from the README by default)
    "title": null,
    "description": null,
    "isbn": null,
    "language": "en",
    "direction": null,
    "author": null,

    // version of gitbook to use
    "gitbook": "*",

    // Structure
    "structure": {
        "langs": "LANGS.md",
        "readme": "README.md",
        "glossary": "GLOSSARY.md",
        "summary": "SUMMARY.md"
    },

    // CSS Styles
    "styles": {
        "website": "styles/website.css",
        "print": "styles/print.css",
        "ebook": "styles/ebook.css",
        "pdf": "styles/pdf.css",
        "mobi": "styles/mobi.css",
        "epub": "styles/epub.css"
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
    // It"s recommended to use plugins or add more options for default theme, though
    // See https://github.com/GitbookIO/gitbook/issues/209
    "theme": path.resolve(__dirname, "../theme"),

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

        // How to mark detected chapters.
        // Choices are “pagebreak”, “rule”, "both" or “none”.
        "chapterMark" : "pagebreak",

        // An XPath expression. Page breaks are inserted before the specified elements.
        // To disable use the expression: "/"
        "pageBreaksBefore": "/",

        // Margin (in pts)
        // Note: 72 pts equals 1 inch
        "margin": {
            "right": 62,
            "left": 62,
            "top": 56,
            "bottom": 56
        },

        //Header HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "headerTemplate": "",

        //Footer HTML template. Available variables: _PAGENUM_, _TITLE_, _AUTHOR_ and _SECTION_.
        "footerTemplate": ""
    }
};

module.exports= Configuration;
