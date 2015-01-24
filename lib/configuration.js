var _ = require("lodash");
var Q = require("q");
var path = require("path");
var npmi = require('npmi');

var fs = require("./utils/fs");

// Default plugins added to each books
var defaultsPlugins = ["mathjax"];

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
            'name': parts[0],
            'version': parts[1] // optional
        }
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
        return { 'name': plugin }
    }))
    .uniq()
    .value();

    // Build final list
    plugins = _.filter(plugins, function(plugin) {
        return !_.contains(toremove, plugin.name) && !(plugin.name.length > 0 && plugin.name[0] == "-");
    });

    return plugins;
}

// Normalize a list of plugin name to use
function normalizePluginsNames(plugins) {
    return _.pluck(normalizePluginsList(plugins), "name");
};


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
        that.options.plugins = normalizePluginsList(that.options.plugins);
        that.options.defaultsPlugins = normalizePluginsList(that.options.defaultsPlugins || "");
        that.options.plugins = _.union(that.options.plugins, that.options.defaultsPlugins);
        that.options.plugins = _.uniq(that.options.plugins, "name");
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
    return _.first(this.options.language.split("-")).toLowerCase();
};

// Install plugins
Configuration.prototype.installPlugins = function(options) {
    var that = this;
    options = _.defaults(options || {
        log: true
    });

    // Remov defaults (no need to install)
    var plugins = _.filter(that.options.plugins, function(plugin) {
        return !_.contains(defaultsPlugins, plugin.name);
    });

    // Install plugins one by one
    if (options.log)  console.log(plugins.length+" plugins to install");
    return _.reduce(plugins, function(prev, plugin) {
        return prev.then(function() {
            var fullname = "gitbook-plugin-"+plugin.name;
            if (options.log) console.log("Install plugin", plugin.name, "from npm ("+fullname+") with version", (plugin.version || "*"));
            return Q.nfcall(npmi, {
                'name': fullname,
                'version': plugin.version,
                'path': that.book.root,
                'npmLoad': {
                    'loglevel': 'silent',
                    'loaded': false,
                    'prefix': that.book.root
                }
            });
        });
    }, Q());
}

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
    "language": "en",

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
    // It's recommended to use plugins or add more options for default theme, though
    // See https://github.com/GitbookIO/gitbook/issues/209
    "theme": path.resolve(__dirname, '../theme'),

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
