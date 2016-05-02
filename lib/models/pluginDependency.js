var is = require('is');
var Immutable = require('immutable');

var DEFAULT_VERSION = '*';

/*
    PluginDependency represents the informations about a plugin
    stored in config.plugins
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
    Create a plugin from a string

    @param {String}
    @return {Plugin|undefined}
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

    return new Plugin({
        name: name,
        version: version || DEFAULT_VERSION,
        enabled: enabled
    });
};

/**
    Create a PluginDependency from a string

    @param {String}
    @return {List<PluginDependency>}
*/
PluginDependency.listFromString = function(s) {
    var parts = s.split(',');
    return PluginDependency.listFromArray(parts);
};

/**
    Create a PluginDependency from an array

    @param {Array}
    @return {List<PluginDependency>}
*/
PluginDependency.listFromArray = function(arr) {
    return Immutable.List(arr)
        .map(function(entry) {
            if (is.string(entry)) {
                return PluginDependency.createFromString(entry);
            } else {
                return PluginDependency({
                    name: entry.name,
                    version: entry.version
                });
            }
        })
        .filter(function(dep) {
            return Boolean(dep.getName());
        });
};

/**
    Export plugin dependencies as an array

    @param {List<PluginDependency>}
    @return {Array<String>}
*/
PluginDependency.listToArray = function(arr) {
    return arr
        .map(function(dep) {
            var result;

            if (dep.isEnabled()) {
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

module.exports = PluginDependency;
