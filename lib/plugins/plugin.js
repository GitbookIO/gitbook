var _ = require('lodash');
var path = require('path');
var resolve = require('resolve');

var Promise = require('../utils/promise');
var error = require('../utils/error');
var gitbook = require('../gitbook');
var registry = require('./registry');

function BookPlugin(book, pluginId) {
    this.book = book;
    this.log = this.book.log;

    this.id = pluginId;
    this.npmId = registry.npmId(pluginId);
    this.root;

    this.packageInfos = undefined;
    this.content = undefined;

    _.bindAll(this);
}

// Return true if plugin has been loaded correctly
BookPlugin.prototype.isLoaded = function() {
    return Boolean(this.packageInfos && this.content);
};

// Load this plugin
BookPlugin.prototype.load = function() {
    var that = this;

    if (this.isLoaded()) {
        return Promise.reject(new Error('Plugin "' + this.id + '" is already loaded'));
    }

    // Try loading plugins from different location
    var p = Promise.some([
        this.book.resolve('node_modules'),
        __dirname
    ], function(baseDir) {
        // Locate plugin and load pacjage.json
        try {
            var res = resolve.sync(that.npmId + '/package.json', { basedir: baseDir });

            that.root = path.dirname(res);
            that.packageInfos = require(res);
        } catch (err) {
            // Wait on https://github.com/substack/node-resolve/pull/81 to be merged
            if (err.message.indexOf('Cannot find module') < 0) throw err;

            that.packageInfos = undefined;
            that.content = undefined;

            return false;
        }

        // Load plugin JS content
        try {
            that.content = require(resolve.sync(that.npmId, { basedir: baseDir }));
        } catch(err) {
            throw new error.PluginError(err, {
                plugin: that.id
            });
        }

        return true;
    })

    .then(that.validate);

    this.log.info('Loading plugin "' + this.id + '" ...');
    return this.log.info.promise(p);
};


// Verify the definition of a plugin
// Also verify that the plugin accepts the current gitbook version
// This method throws erros if plugin is invalid
BookPlugin.prototype.validate = function() {
    var isValid = (
        this.packageInfos &&
        this.packageInfos.name &&
        this.packageInfos.engines &&
        this.packageInfos.engines.gitbook
    );

    if (!this.isLoaded()) {
        throw new Error('Couldn\'t locate plugin "' + this.id + '", Run \'gitbook install\' to install plugins from registry.');
    }

    if (!isValid) {
        throw new Error('Invalid plugin "' + this.id + '"');
    }

    if (!gitbook.satisfies(this.packageInfos.engines.gitbook)) {
        throw new Error('GitBook doesn\'t satisfy the requirements of this plugin: '+this.packageInfos.engines.gitbook);
    }
};

module.exports = BookPlugin;
