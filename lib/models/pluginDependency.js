var is = require('is');
var semver = require('semver');
var Immutable = require('immutable');

var PREFIX = require('../constants/pluginPrefix');
var DEFAULT_VERSION = '*';

/*
 * PluginDependency represents the informations about a plugin
 * stored in config.plugins
 */
var PluginDependency = Immutable.Record({
    name:       String(),

    // Requirement version (ex: ">1.0.0")
    version:    String(DEFAULT_VERSION),

    // Is this plugin enabled or disabled?
    enabled:    Boolean(true)
}, 'PluginDependency');

PluginDependency.prototype.getName = function() {
    return this.get('name');
};

PluginDependency.prototype.getVersion = function() {
    return this.get('version');
};

PluginDependency.prototype.isEnabled = function() {
    return this.get('enabled');
};

/**
 * Toggle this plugin state
 * @param  {Boolean}
 * @return {PluginDependency}
 */
PluginDependency.prototype.toggle = function(state) {
    if (is.undef(state)) {
        state = !this.isEnabled();
    }

    return this.set('enabled', state);
};

/**
 * Return NPM ID for the dependency
 * @return {String}
 */
PluginDependency.prototype.getNpmID = function() {
    return PluginDependency.nameToNpmID(this.getName());
};

/**
 * Is the plugin using a git dependency
 * @return {Boolean}
 */
PluginDependency.prototype.isGitDependency = function() {
    return !semver.validRange(this.getVersion());
};

/**
 * Create a plugin with a name and a plugin
 * @param {String}
 * @return {Plugin|undefined}
 */
PluginDependency.create = function(name, version, enabled) {
    if (is.undefined(enabled)) {
        enabled = true;
    }

    return new PluginDependency({
        name: name,
        version: version || DEFAULT_VERSION,
        enabled: Boolean(enabled)
    });
};

/**
 * Create a plugin from a string
 * @param {String}
 * @return {Plugin|undefined}
 */
PluginDependency.createFromString = function(s) {
    var parts = s.split('@');
    var name = parts[0];
    var version = parts.slice(1).join('@');
    var enabled = true;

    if (name[0] === '-') {
        enabled = false;
        name = name.slice(1);
    }

    return new PluginDependency({
        name: name,
        version: version || DEFAULT_VERSION,
        enabled: enabled
    });
};

/**
 * Create a PluginDependency from a string
 * @param {String}
 * @return {List<PluginDependency>}
 */
PluginDependency.listFromString = function(s) {
    var parts = s.split(',');
    return PluginDependency.listFromArray(parts);
};

/**
 * Create a PluginDependency from an array
 * @param {Array}
 * @return {List<PluginDependency>}
 */
PluginDependency.listFromArray = function(arr) {
    return Immutable.List(arr)
        .map(function(entry) {
            if (is.string(entry)) {
                return PluginDependency.createFromString(entry);
            } else {
                return PluginDependency({
                    name: entry.get('name'),
                    version: entry.get('version')
                });
            }
        })
        .filter(function(dep) {
            return Boolean(dep.getName());
        });
};

/**
 * Export plugin dependencies as an array
 * @param {List<PluginDependency>} list
 * @return {Array<String>}
 */
PluginDependency.listToArray = function(list) {
    return list
        .map(function(dep) {
            var result = '';

            if (!dep.isEnabled()) {
                result += '-';
            }

            result += dep.getName();
            if (dep.getVersion() !== DEFAULT_VERSION) {
                result += '@' + dep.getVersion();
            }

            return result;
        })
        .toJS();
};

/**
 * Return NPM id for a plugin name
 * @param {String}
 * @return {String}
 */
PluginDependency.nameToNpmID = function(s) {
    return PREFIX + s;
};

module.exports = PluginDependency;
