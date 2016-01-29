var path = require('path');
var resolve = require('resolve');

var Promise = require('../utils/promise');

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

    .then(function() {
        if (!that.isLoaded()) {
            throw new Error('Couldn\'t locate plugin "' + that.id + '", Run \'gitbook install\' to install plugins from registry.');
        }
    });

    this.log.info.log('Loading plugin "' + this.id + '" ...');
    return this.log.info.promise('', promise);
};

module.exports = BookPlugin;
