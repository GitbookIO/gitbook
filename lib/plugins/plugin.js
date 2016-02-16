var _ = require('lodash');
var path = require('path');
var resolve = require('resolve');

var Promise = require('../utils/promise');
var gitbook = require('../gitbook');

var PLUGIN_PREFIX = 'gitbook-plugin-';

// Return an absolute name for the plugin (the one on NPM)
function npmId(name) {
    if (name.indexOf(PLUGIN_PREFIX) === 0) return name;
    return [PLUGIN_PREFIX, name].join('');
}


function BookPlugin(book, pluginId) {
    this.book = book;
    this.log = this.book.log;

    this.id = pluginId;
    this.npmId = npmId(pluginId);
    this.baseDir;

    this.packageInfos = undefined;
    this.content = undefined;
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
    var promise = Promise.some([
        this.book.resolve('node_modules'),
        __dirname
    ], function(baseDir) {
        // Locate plugin and load pacjage.json
        try {
            var res = resolve.sync(name + '/package.json', { basedir: baseDir });

            that.baseDir = path.dirname(res);
            that.packageInfos = require(res);
        } catch (err) {
            if (err.code != 'MODULE_NOT_FOUND') throw err;

            that.packageInfos = undefined;
            that.content = undefined;

            return false;
        }

        // Load plugin JS content
        that.content = require(resolve.sync(name, { basedir: baseDir }));
        return true;
    })

    .then(that.validate);

    this.log.info.log('Loading plugin "' + this.id + '" ...');
    return this.log.info.promise('', promise);
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
