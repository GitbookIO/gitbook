var _ = require('lodash');
var Q = require('q');
var path = require('path');
var semver = require('semver');

var pkg = require('../package.json');
var i18n = require('./utils/i18n');
var version = require('./version');

var DEFAULT_CONFIG = require('./config_default');

// Default plugins added to each books
var DEFAULT_PLUGINS = ['highlight', 'search', 'sharing', 'fontsettings'];

// Check if a plugin is a default plugin
// Plugin should be in the list
// And version from book.json specified for this plugin should be satisfied
function isDefaultPlugin(name, version) {
    if (!_.contains(DEFAULT_PLUGINS, name)) return false;

    try {
        var pluginPkg = require('gitbook-plugin-'+name+'/package.json');
        return semver.satisfies(pluginPkg.version, version || '*');
    } catch(e) {
        return false;
    }
}

// Normalize a list of plugins to use
function normalizePluginsList(plugins, addDefaults) {
    // Normalize list to an array
    plugins = _.isString(plugins) ? plugins.split(',') : (plugins || []);

    // Remove empty parts
    plugins = _.compact(plugins);

    // Divide as {name, version} to handle format like 'myplugin@1.0.0'
    plugins = _.map(plugins, function(plugin) {
        if (plugin.name) return plugin;

        var parts = plugin.split('@');
        var name = parts[0];
        var version = parts[1];
        return {
            'name': name,
            'version': version, // optional
            'isDefault': isDefaultPlugin(name, version)
        };
    });

    // List plugins to remove
    var toremove = _.chain(plugins)
    .filter(function(plugin) {
        return plugin.name.length > 0 && plugin.name[0] == '-';
    })
    .map(function(plugin) {
        return plugin.name.slice(1);
    })
    .value();

    // Merge with defaults
    if (addDefaults !== false) {
        _.each(DEFAULT_PLUGINS, function(plugin) {
            if (_.find(plugins, { name: plugin })) {
                return;
            }

            plugins.push({
                'name': plugin,
                'isDefault': true
            });
        });
    }

    // Remove plugin that start with '-'
    plugins = _.filter(plugins, function(plugin) {
        return !_.contains(toremove, plugin.name) && !(plugin.name.length > 0 && plugin.name[0] == '-');
    });

    // Remove duplicates
    plugins = _.uniq(plugins, 'name');

    return plugins;
}

var Configuration = function(book, options) {
    this.book = book;
    this.replace(options);
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
                _.omit(_config, 'configFile', 'defaultsPlugins', 'generator', 'extension')
            );
        }
        catch(err) {
            if (err instanceof SyntaxError) return Q.reject(err);
            return Q();
        }
    })
    .then(function() {
        if (!that.book.isSubBook()) {
            if (!version.satisfies(that.options.gitbook)) {
                throw new Error('GitBook version doesn\'t satisfy version required by the book: '+that.options.gitbook);
            }
            if (that.options.gitbook != '*' && !semver.satisfies(semver.inc(pkg.version, 'patch'), that.options.gitbook)) {
                that.book.log.warn.ln('gitbook version specified in your book.json might be too strict for future patches, \''+(_.first(pkg.version.split('.'))+'.x.x')+'\' is more adequate');
            }
        }

        that.options.output = path.resolve(that.options.output || that.book.resolve('_book'));
        that.options.plugins = normalizePluginsList(that.options.plugins);
        that.options.defaultsPlugins = normalizePluginsList(that.options.defaultsPlugins || '', false);
        that.options.plugins = _.union(that.options.plugins, that.options.defaultsPlugins);
        that.options.plugins = _.uniq(that.options.plugins, 'name');

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

// Replace the whole configuration
Configuration.prototype.replace = function(options) {
    var that = this;

    this.options = _.cloneDeep(DEFAULT_CONFIG);
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

// Dump configuration as json object
Configuration.prototype.dump = function() {
    return _.cloneDeep(this.options);
};

// Get structure file
Configuration.prototype.getStructure = function(name, dontStripExt) {
    var filename = this.options.structure[name];
    if (dontStripExt) return filename;

    filename = filename.split('.').slice(0, -1).join('.');
    return filename;
};

// Return normalized language
Configuration.prototype.normalizeLanguage = function() {
    return i18n.normalizeLanguage(this.options.language);
};

// Return a configuration
Configuration.prototype.get = function(key, def) {
    return _.get(this.options, key, def);
};

// Update a configuration
Configuration.prototype.set = function(key, value) {
    return _.set(this.options, key, value);
};

// Default configuration
Configuration.DEFAULT = DEFAULT_CONFIG;

module.exports= Configuration;
