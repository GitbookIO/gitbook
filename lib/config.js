var Q = require('q');
var _ = require('lodash');
var semver = require('semver');
var path = require('path');

var gitbook = require('./gitbook');
var configDefault = require('./config_default');

/*
Config is an interface for the book's configuration stored in "book.json" (or "book.js")
*/

function Config(book, baseConfig) {
    this.book = book;
    this.fs = book.fs;
    this.log = book.log;

    this.replace(baseConfig || {});
}

// Load configuration of the book
// and verify that the configuration is satisfying
Config.prototype.load = function() {
    var that = this;

    this.log.debug.ln('loading configuration');
    return this.fs.loadAsObject(this.book.resolve('book'))
    .fail(function(err) {
        if (err.code != 'MODULE_NOT_FOUND') throw(err);
        else return Q({});
    })
    .then(function(_config) {
        return that.replace(_config);
    })
    .then(function() {
        if (!that.book.isLanguageBook()) {
            if (!gitbook.satisfies(that.options.gitbook)) {
                throw new Error('GitBook version doesn\'t satisfy version required by the book: '+that.options.gitbook);
            }
            if (that.options.gitbook != '*' && !semver.satisfies(semver.inc(gitbook.version, 'patch'), that.options.gitbook)) {
                that.log.warn.ln('gitbook version specified in your book.json might be too strict for future patches, \''+(_.first(gitbook.version.split('.'))+'.x.x')+'\' is more adequate');
            }
        }

        //that.options.output = path.resolve(that.options.output || that.book.resolve('_book'));
        //that.options.plugins = normalizePluginsList(that.options.plugins);
        //that.options.defaultsPlugins = normalizePluginsList(that.options.defaultsPlugins || '', false);
        //that.options.plugins = _.union(that.options.plugins, that.options.defaultsPlugins);
        //that.options.plugins = _.uniq(that.options.plugins, 'name');

        // Default value for text direction (from language)
        /*if (!that.options.direction) {
            var lang = i18n.getCatalog(that.options.language);
            if (lang) that.options.direction = lang.direction;
        }*/

        that.options.gitbook = gitbook.version;
    });
};

// Replace the whole configuration
Config.prototype.replace = function(options) {
    var that = this;

    this.options = _.cloneDeep(configDefault);
    this.options = _.merge(this.options, options || {});

    // options.input == book.root
    Object.defineProperty(this.options, 'input', {
        get: function () {
            return that.book.root;
        }
    });

    // options.originalInput == book.parent.root
    Object.defineProperty(this.options, 'originalInput', {
        get: function () {
            return that.book.parent? that.book.parent.root : undefined;
        }
    });

    // options.originalOutput == book.parent.options.output
    Object.defineProperty(this.options, 'originalOutput', {
        get: function () {
            return that.book.parent? that.book.parent.options.output : undefined;
        }
    });
};

// Return path to a structure file
// Strip the extension by default
Config.prototype.getStructure = function(name, dontStripExt) {
    var filename = this.options.structure[name];
    if (dontStripExt) return filename;

    filename = filename.split('.').slice(0, -1).join('.');
    return filename;
};

// Return a configuration using a key and a default value
Config.prototype.get = function(key, def) {
    return _.get(this.options, key, def);
};

// Update a configuration
Config.prototype.set = function(key, value) {
    return _.set(this.options, key, value);
};

module.exports = Config;
