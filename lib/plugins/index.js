var _ = require('lodash');

var Promise = require('../utils/promise');
var BookPlugin = require('./plugin');
var registry = require('./registry');

/*
PluginsManager is an interface to work with multiple plugins at once:
- Extract assets from plugins
- Call hooks for all plugins, etc
*/

function PluginsManager(book) {
    this.book = book;
    this.log = this.book.log;
    this.plugins = [];

    _.bindAll(this);
}

// Return count of plugins loaded
PluginsManager.prototype.count = function() {
    return _.size(this.plugins);
};

// Returns a plugin by its name
PluginsManager.prototype.get = function(name) {
    return _.find(this.plugins, {
        id: name
    });
};

// Load a plugin, or a list of plugins
PluginsManager.prototype.load = function(name) {
    var that = this;

    if (_.isArray(name)) {
        return Promise.serie(name, function(_name) {
            return that.load(_name);
        });
    }

    return Promise()

    // Initiate and load the plugin
    .then(function() {
        var plugin;

        if (!_.isString(name)) plugin = name;
        else plugin = new BookPlugin(that.book, name);

        if (that.get(plugin.id)) {
            throw new Error('Plugin "'+plugin.id+'" is already loaded');
        }


        if (plugin.isLoaded()) return plugin;
        else return plugin.load()
            .thenResolve(plugin);
    })

    // Setup the plugin
    .then(this._setup);
};

// Setup a plugin
// Register its filter, blocks, etc
PluginsManager.prototype._setup = function(plugin) {
    this.plugins.push(plugin);
};

// Install all plugins for the book
PluginsManager.prototype.install = function() {
    this.log.info.ln('installing 0 plugins');
};

module.exports = PluginsManager;
