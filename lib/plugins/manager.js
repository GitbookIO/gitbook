var _ = require('lodash');

var Promise = require('../utils/promise');
var BookPlugin = require('./plugin');


/*
PluginsManager is an interface to work with multiple plugins at once:
- Extract assets from plugins
- Call hooks for all plugins, etc
*/

function PluginsManager(book) {
    this.book = book;
    this.plugins = [];
}

// Returns a plugin by its name
PluginsManager.prototype.get = function(name) {
    return _.find(this.plugins, {
        id: name
    });
};

// Load a plugin, or a list of plugins
PluginsManager.prototype.load = function(name) {
    var that = this;

    if (!_.isArray(name)) {
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

    .then(function(plugin) {
        that.plugins.push(plugin);
    });
};



module.exports = PluginsManager;
