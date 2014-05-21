var _ = require("lodash");
var Q = require("q");
var semver = require("semver");
var path = require("path");
var url = require("url");
var fs = require("./fs");
var resolve = require('resolve');

var pkg = require("../../package.json");

var  RESOURCES = ["js", "css"];

var Plugin = function(name, root) {
    this.name = name;
    this.root = root;
    this.packageInfos = {};
    this.infos = {};

    _.each([
        "gitbook-plugin-"+name,
        "gitbook-theme-"+name,
        "gitbook-"+name,
        name,
    ], function(_name) {
        if (this.load(_name, __dirname)) return false;
        if (this.load(_name, path.resolve(root))) return false;
    }, this);
};

// Load from a name
Plugin.prototype.load = function(name, baseDir) {
    try {
        var res = resolve.sync(name+"/package.json", { basedir: baseDir });

        this.baseDir = path.dirname(res);
        this.packageInfos = require(res);
        this.infos = require(resolve.sync(name, { basedir: baseDir }));
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
    return _.chain(this.infos.book[resource])
    .map(function(resource) {
        var parsed = url.parse(resource);
        if (parsed.protocol) return {"url": resource}
        else return { "path": this.name+"/"+resource };
    }.bind(this))
    .value();
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

// Resolve file path
Plugin.prototype.resolveFile = function(filename) {
    return path.resolve(this.baseDir, filename);
};

// Resolve file path
Plugin.prototype.callHook = function(name, context, data) {
    var hookFunc = this.infos.hooks? this.infos.hooks[name] : null;
    data = data || {};

    if (!hookFunc) return Q(data);

    return Q()
    .then(function() {
        return hookFunc.apply(context, [data]);
    });
};

// Has assets
Plugin.prototype.hasAssets = function(out) {
    return (this.infos.book && this.infos.book.assets);
};

// Copy plugin assets fodler
Plugin.prototype.copyAssets = function(out) {
    if (!this.hasAssets()) return Q();
    return fs.copy(
        this.resolveFile(this.infos.book.assets),
        out
    );
};




// Normalize a list of plugin name to use
Plugin.normalizeNames = function(names) {
    // Normalize list to an array
    names = _.isString(names) ? names.split(",") : (names || []);

    // List plugins to remove
    var toremove = _.chain(names)
    .filter(function(name) {
        return name.length > 0 && name[0] == "-";
    })
    .map(function(name) {
        return name.slice(1)
    })
    .value();

    // Merge with defaults
    names = _.chain(names)
    .concat(Plugin.defaults)
    .uniq()
    .value();

    // Remove plugins starting with
    names = _.filter(names, function(name) {
        return !_.contains(toremove, name) && !(name.length > 0 && name[0] == "-");
    });

    return names;
};

// Extract data from a list of plugin
Plugin.fromList = function(names, root) {
    var failed = [];

    // Load plugins
    var plugins = _.map(names, function(name) {
        var plugin = new Plugin(name, root);
        if (!plugin.isValid()) failed.push(name);
        return plugin;
    });

    if (_.size(failed) > 0) return Q.reject(new Error("Error loading plugins: "+failed.join(",")));

    // Get all resources
    var resources = _.chain(RESOURCES)
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
        'list': plugins,
        'resources': resources,
        'hook': function(name, context, data) {
            return _.reduce(plugins, function(prev, plugin) {
                return prev.then(function(ret) {
                    return plugin.callHook(name, context, ret);
                })
            }, Q(data));
        },
        'template': function(name) {
            var withTpl = _.find(plugins, function(plugin) {
                return (plugin.infos.templates
                    && plugin.infos.templates[name]);
            });

            if (!withTpl) return null;
            return withTpl.resolveFile(withTpl.infos.templates[name]);
        }
    });
};

// Default plugins
Plugin.defaults = [
    "mixpanel",
    "mathjax"
];

module.exports = Plugin;
