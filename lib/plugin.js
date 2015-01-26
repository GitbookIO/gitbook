var _ = require("lodash");
var Q = require("q");
var semver = require("semver");
var path = require("path");
var url = require("url");
var fs = require("./utils/fs");
var resolve = require('resolve');

var pkg = require("../package.json");

var Plugin = function(book, name) {
    this.book = book;
    this.name = name;
    this.packageInfos = {};
    this.infos = {};

    // Bind methods
    _.bindAll(this);

    _.each([
        "gitbook-plugin-"+name,
        "gitbook-"+name,
        name,
    ], function(_name) {
        if (this.load(_name, __dirname)) return false;
        if (this.load(_name, book.root)) return false;
    }, this);
};

// Type of plugins resources
Plugin.RESOURCES = ["js", "css"];
Plugin.HOOKS = [
    "init", "finish"
]

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

Plugin.prototype.normalizeResource = function(resource) {
    // Parse the resource path
    var parsed = url.parse(resource);

    // This is a remote resource
    // so we will simply link to using it's URL
    if (parsed.protocol) {
        return {
            "url": resource
        };
    }

    // This will be copied over from disk
    // and shipped with the book's build
    return { "path": this.name+"/"+resource };
};

// Return resources
Plugin.prototype._getResources = function(base) {
    base = base || "book";
    var book = this.infos[base];

    // Nothing specified, fallback to default
    if (!book) {
        return Q({});
    }

    // Dynamic function
    if(typeof book === "function") {
        // Call giving it the context of our generator
        return Q().then(book.bind(this.book));
    }

    // Plain data object
    return Q(_.cloneDeep(book));
};

// Normalize resources and return them
Plugin.prototype.getResources = function(base) {
    var that = this;

    return this._getResources(base)
    .then(function(resources) {

        _.each(Plugin.RESOURCES, function(resourceType) {
            resources[resourceType] = (resources[resourceType] || []).map(that.normalizeResource);
        });

        return resources;
    });
};

// Test if it's a valid plugin
Plugin.prototype.isValid = function() {
    var that = this;
    var isValid = (
        this.packageInfos &&
        this.packageInfos.name &&
        this.packageInfos.engines &&
        this.packageInfos.engines.gitbook &&
        semver.satisfies(pkg.version, this.packageInfos.engines.gitbook)
    );

    // Valid hooks
    _.each(this.infos.hooks, function(hook, hookName) {
        if (_.contains(Plugin.HOOKS, hookName)) return;
        that.book.log.warn.ln("Hook '"+hookName+" 'used by plugin '"+that.packageInfos.name+"' has been removed or is deprecated");
    });

    return isValid;
};

// Resolve file path
Plugin.prototype.resolveFile = function(filename) {
    return path.resolve(this.baseDir, filename);
};

// Resolve file path
Plugin.prototype.callHook = function(name, data) {
    // Our generator will be the context to apply
    var context = this.book;

    var hookFunc = this.infos.hooks? this.infos.hooks[name] : null;
    data = data || {};

    if (!hookFunc) return Q(data);

    this.book.log.debug.ln("call hook", name);
    if (!_.contains(Plugin.HOOKS, name)) this.book.log.warn.ln("hook '"+name+"' used by plugin '"+this.name+"' is deprecated, and will be remove in the coming versions");

    return Q()
    .then(function() {
        return hookFunc.apply(context, [data]);
    });
};

// Copy plugin assets fodler
Plugin.prototype.copyAssets = function(out, options) {
    var that = this;
    options = _.defaults(options || {}, {
        base: "book"
    });

    return this.getResources(options.base)
    .get('assets')
    .then(function(assets) {
        // Assets are undefined
        if(!assets) return false;

        return fs.copy(
            that.resolveFile(assets),
            out
        ).then(_.constant(true));
    }, _.constant(false));
};


// Extract data from a list of plugin
Plugin.normalize = function(plugins, generator, options) {
    options = _.defaults(options || {}, {
        assetsBase: "book"
    });

    // The raw resources extracted from each plugin
    var pluginResources;

    // Get resources of plugins
    return Q.all(_.map(plugins, function(plugin) {
        return plugin.getResources(options.assetsBase);
    }))

    // Extract resources out
    // css, js, etc ...
    .then(function(resources) {
        pluginResources = resources;
        // Group by resource types
        return _.chain(Plugin.RESOURCES)
        .map(function(resourceType) {
            // Get resources from all the plugins for this current type
            return [
                // Key
                resourceType,
                // Value
                _.chain(resources)
                .pluck(resourceType)
                .compact()
                .flatten()
                .value()
            ];
        })
        .object()
        .value();
    })
    // Extract html snippets
    .then(function(resources) {
        // Map of html resources by name added by each plugin
        resources.html = pluginResources.reduce(function(accu, resource) {
            var html = (resource && resource.html) || {};
            _.each(html, function(code, key) {
                // Turn into function if not one already
                if (!_.isFunction(code)) code = _.constant(code);
                // Append
                accu[key] = (accu[key] || []).concat([code]);
            });

            return accu;
        }, {});

        return resources;
    })
    // Return big multi-plugin object
    .then(function(resources) {
        return {
            'list': plugins,
            'resources': resources,
            'hook': function(name, data) {
                return _.reduce(plugins, function(prev, plugin) {
                    return prev.then(function(ret) {
                        return plugin.callHook(name, ret);
                    });
                }, Q(data));
            },
            'template': function(name) {
                var withTpl = _.find(plugins, function(plugin) {
                    return (
                        plugin.infos.templates &&
                        plugin.infos.templates[name]
                    );
                });

                if (!withTpl) return null;
                return withTpl.resolveFile(withTpl.infos.templates[name]);
            },
            'html': function(tag, context, options) {
                return _.map(resources.html[tag] || [], function(code) {
                    return code.call(context, options);
                }).join("\n");
            }
        };
    });
};

module.exports = Plugin;
