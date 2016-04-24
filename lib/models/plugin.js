var Immutable = require('immutable');

var TemplateBlock = require('./templateBlock');
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
    return Plugin.nameToNpmID(this.getName());
};

/**
    Check if a plugin is loaded

    @return {Boolean}
*/
Plugin.prototype.isLoaded = function() {
    return Boolean(this.getPackage().size > 0 && this.getContent().size > 0);
};

/**
    Return map of hooks
    @return {Map<String:Function>}
*/
Plugin.prototype.getHooks = function() {
    return this.getContent().get('hooks');
};

/**
    Return map of filters
    @return {Map<String:Function>}
*/
Plugin.prototype.getFilters = function() {
    return this.getContent().get('filters');
};

/**
    Return map of blocks
    @return {List<TemplateBlock>}
*/
Plugin.prototype.getBlocks = function() {
    var blocks = this.getContent().get('blocks');

    return blocks
        .map(function(block, blockName) {
            block.name = blockName;
            return new TemplateBlock(block);
        })
        .toList();
};

/**
    Return a specific hook

    @param {String} name
    @return {Function|undefined}
*/
Plugin.prototype.getHook = function(name) {
    return this.getHooks().get(name);
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

/**
    Return NPM id for a plugin name

    @param {String}
    @return {String}
*/
Plugin.nameToNpmID = function(s) {
    return PREFIX + s;
};

module.exports = Plugin;
