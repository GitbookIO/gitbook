var _ = require("lodash");
var Q = require("q");
var semver = require("semver");
var fs = require("./fs");

var pkg = require("../../package.json");

var Plugin = function(name) {
    this.name = name;
    this.packageInfos = {};
    this.infos = {};

    _.each([
        name,
        "gitbook-plugin-"+name,
        "gitbook-theme-"+name
    ], function(_name) {
        if (this.load(_name)) return false;
    }.bind(this));
};

// Load from a name
Plugin.prototype.load = function(name) {
    try {
        this.packageInfos = require(name+"/package.json");
        this.infos = require(name);
        this.name = name;

        return true;
    } catch (e) {
        return false;
    }
};

// Return resources
Plugin.prototype.getResources = function(resource) {
    if (!this.infos.book || !this.infos.book[resource]) {
        return [];
    }
    return this.infos.book[resource];
};

// Test if it's a valid plugin
Plugin.prototype.isValid = function() {
    return (
        this.packageInfos
        && this.packageInfos.name
        && this.packageInfos.engines
        && this.packageInfos.engines.gitbook
        && semver.satisfies(pkg.version, this.packageInfos.engines.gitbook)
    );
};

// Extract data from a list of plugin
Plugin.fromList = function(names) {
    var failed = [];

    // Load plugins
    var plugins = _.map(names, function(name) {
        var plugin = new Plugin(name);
        if (!plugin.isValid()) failed.push(name);
        return plugin;
    });

    if (_.size(failed) > 0) return Q.reject(new Error("Error loading plugins: "+failed.join(":")));

    // Get all resources
    var resources = _.chain([
        "js", "css"
    ])
    .map(function(resource) {
        return [
            resource,
            _.chain(plugins)
            .map(function(plugin) {
                return plugin.getResources(resource);
            })
            .flatten()
            .value()
        ];
    })
    .object()
    .value();

    return Q({
        'plugins': plugins,
        'resources': resources
    });
};

// Default plugins
Plugin.defaults = [
    "mixpanel"
];

module.exports = Plugin;