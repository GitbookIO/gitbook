var Immutable = require('immutable');

var PREFIX = require('../constants/pluginPrefix');
var DEFAULT_VERSION = '*';

var Plugin = Immutable.Record({
    name:       String(),

    // Requirement version (ex: ">1.0.0")
    version:    String(DEFAULT_VERSION),

    // Path to load this plugin
    path:       String(),

    // Depth of this plugin in the dependency tree
    depth:      Number(0),

    // Content of the "package.json"
    package:    Immutable.Map(),

    // Content of the package itself
    content:    Immutable.Map()
}, 'Plugin');

Plugin.prototype.getName = function() {
    return this.get('name');
};

Plugin.prototype.getPath = function() {
    return this.get('path');
};

Plugin.prototype.getVersion = function() {
    return this.get('version');
};

Plugin.prototype.getPackage = function() {
    return this.get('package');
};

Plugin.prototype.getContent = function() {
    return this.get('content');
};

Plugin.prototype.getDepth = function() {
    return this.get('depth');
};

/**
    Return the ID on NPM for this plugin

    @return {String}
*/
Plugin.prototype.getNpmID = function() {
    return PREFIX + this.getName();
};

/**
    Check if a plugin is loaded

    @return {Boolean}
*/
Plugin.prototype.isLoaded = function() {
    return Boolean(this.getPackage().size > 0 && this.getContent().size > 0);
};

/**
    Create a plugin from a string

    @param {String}
    @return {Plugin}
*/
Plugin.createFromString = function(s) {
    var parts = s.split('@');
    var name = parts[0];
    var version = parts.slice(1).join('@');

    return new Plugin({
        name: name,
        version: version || DEFAULT_VERSION
    });
};

module.exports = Plugin;
