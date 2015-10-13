var _ = require('lodash');
var Q = require('q');
var path = require('path');
var url = require('url');
var fs = require('./utils/fs');
var resolve = require('resolve');
var mergeDefaults = require('merge-defaults');
var jsonschema = require('jsonschema');
var jsonSchemaDefaults = require('json-schema-defaults');

var version = require('./version');

var PLUGIN_PREFIX = 'gitbook-plugin-';

// Return an absolute name for the plugin (the one on NPM)
function absoluteName(name) {
    if (name.indexOf(PLUGIN_PREFIX) === 0) return name;
    return [PLUGIN_PREFIX, name].join('');
}


var Plugin = function(book, name) {
    this.book = book;
    this.name = absoluteName(name);
    this.packageInfos = {};
    this.infos = {};

    // Bind methods
    _.bindAll(this);

    _.each([
        absoluteName(name),
        name
    ], function(_name) {
        // Load from the book
        if (this.load(_name, book.root)) return false;

        // Load from default plugins
        if (this.load(_name, __dirname)) return false;
    }, this);
};

// Type of plugins resources
Plugin.RESOURCES = ['js', 'css'];
Plugin.HOOKS = [
    'init', 'finish', 'finish:before', 'config', 'page', 'page:before'
];

// Return the reduce name for the plugin
// "gitbook-plugin-test" -> "test"
// Return a relative name for the plugin (the one on GitBook)
Plugin.prototype.reducedName = function() {
    return this.name.replace(PLUGIN_PREFIX, '');
};

// Load from a name
Plugin.prototype.load = function(name, baseDir) {
    try {
        var res = resolve.sync(name+'/package.json', { basedir: baseDir });

        this.baseDir = path.dirname(res);
        this.packageInfos = require(res);
        this.infos = require(resolve.sync(name, { basedir: baseDir }));
        this.name = this.packageInfos.name;

        return true;
    } catch (e) {
        this.packageInfos = {};
        this.infos = {};
        return false;
    }
};

Plugin.prototype.normalizeResource = function(resource) {
    // Parse the resource path
    var parsed = url.parse(resource);

    // This is a remote resource
    // so we will simply link to using it's URL
    if (parsed.protocol) {
        return {
            'url': resource
        };
    }

    // This will be copied over from disk
    // and shipped with the book's build
    return { 'path': this.name+'/'+resource };
};

// Return resources
Plugin.prototype._getResources = function(base) {
    base = base;
    var book = this.infos[base];

    // Compatibility with version 1.x.x
    if (base == 'website') book = book || this.infos.book;

    // Nothing specified, fallback to default
    if (!book) {
        return Q({});
    }

    // Dynamic function
    if(typeof book === 'function') {
        // Call giving it the context of our book
        return Q().then(book.bind(this.book));
    }

    // Plain data object
    return Q(_.cloneDeep(book));
};

// Normalize resources and return them
Plugin.prototype.getResources = function(base) {
    var that = this;

    return this._getResources(base)
    .then(function(resources) {

        _.each(Plugin.RESOURCES, function(resourceType) {
            resources[resourceType] = (resources[resourceType] || []).map(that.normalizeResource);
        });

        return resources;
    });
};

// Normalize filters and return them
Plugin.prototype.getFilters = function() {
    return this.infos.filters || {};
};

// Normalize blocks and return them
Plugin.prototype.getBlocks = function() {
    return this.infos.blocks || {};
};

// Test if it's a valid plugin
Plugin.prototype.isValid = function() {
    var that = this;
    var isValid = (
        this.packageInfos &&
        this.packageInfos.name &&
        this.packageInfos.engines &&
        this.packageInfos.engines.gitbook &&
        version.satisfies(this.packageInfos.engines.gitbook)
    );

    // Valid hooks
    _.each(this.infos.hooks, function(hook, hookName) {
        if (_.contains(Plugin.HOOKS, hookName)) return;
        that.book.log.warn.ln('Hook "'+hookName+'"" used by plugin "'+that.packageInfos.name+'" has been removed or is deprecated');
    });

    return isValid;
};

// Normalize, validate configuration for this plugin using its schema
// Throw an error when shcema is not respected
Plugin.prototype.validateConfig = function(config) {
    var that = this;

    return Q()
    .then(function() {
        var schema = that.packageInfos.gitbook || {};
        if (!schema) return config;

        // Normalize schema
        schema.id = '/pluginsConfig.'+that.reducedName();
        schema.type = 'object';

        // Validate and throw if invalid
        var v = new jsonschema.Validator();
        var result = v.validate(config, schema, {
            propertyName: 'pluginsConfig.'+that.reducedName()
        });

        // Throw error
        if (result.errors.length > 0) {
            throw new Error('Configuration Error: '+result.errors[0].stack);
        }

        // Insert default values
        var defaults = jsonSchemaDefaults(schema);
        return mergeDefaults(config, defaults);
    });
};

// Resolve file path
Plugin.prototype.resolveFile = function(filename) {
    return path.resolve(this.baseDir, filename);
};

// Resolve file path
Plugin.prototype.callHook = function(name, data) {
    // Our book will be the context to apply
    var context = this.book;

    var hookFunc = this.infos.hooks? this.infos.hooks[name] : null;
    data = data || {};

    if (!hookFunc) return Q(data);

    this.book.log.debug.ln('call hook', name);
    if (!_.contains(Plugin.HOOKS, name)) this.book.log.warn.ln('hook "'+name+'" used by plugin "'+this.name+'" is deprecated, and will be removed in the coming versions');

    return Q()
    .then(function() {
        return hookFunc.apply(context, [data]);
    });
};

// Copy plugin assets fodler
Plugin.prototype.copyAssets = function(out, base) {
    var that = this;

    return this.getResources(base)
    .get('assets')
    .then(function(assets) {
        // Assets are undefined
        if(!assets) return false;

        return fs.copy(
            that.resolveFile(assets),
            out
        ).then(_.constant(true));
    }, _.constant(false));
};

// Get config from book
Plugin.prototype.getConfig = function() {
    return this.book.config.get('pluginsConfig.'+this.reducedName(), {});
};

// Set configuration for this plugin
Plugin.prototype.setConfig = function(values) {
    return this.book.config.set('pluginsConfig.'+this.reducedName(), values);
};

module.exports = Plugin;
