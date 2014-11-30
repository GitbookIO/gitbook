var _ = require("lodash");
var Q = require("q");
var semver = require("semver");
var path = require("path");
var url = require("url");
var fs = require("./fs");
var npmi = require('npmi');
var resolve = require('resolve');

var pkg = require("../../package.json");

var RESOURCES = ["js", "css"];

var Plugin = function(name, root, generator) {
    this.name = name;
    this.root = root;
    this.packageInfos = {};
    this.infos = {};
    this.generator = generator;

    // Bind methods
    _.bindAll(this);

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
        return Q().then(book.bind(this.generator));
    }

    // Plain data object
    return Q(_.cloneDeep(book));
};

// Normalize resources and return them
Plugin.prototype.getResources = function(base) {
    var that = this;

    return this._getResources(base)
    .then(function(resources) {

        _.each(RESOURCES, function(resourceType) {
            resources[resourceType] = (resources[resourceType] || []).map(that.normalizeResource);
        });

        return resources;
    });
};

// Test if it's a valid plugin
Plugin.prototype.isValid = function() {
    return (
        this.packageInfos &&
        this.packageInfos.name &&
        this.packageInfos.engines &&
        this.packageInfos.engines.gitbook &&
        semver.satisfies(pkg.version, this.packageInfos.engines.gitbook)
    );
};

// Resolve file path
Plugin.prototype.resolveFile = function(filename) {
    return path.resolve(this.baseDir, filename);
};

// Resolve file path
Plugin.prototype.callHook = function(name, data) {
    // Our generator will be the context to apply
    var context = this.generator;

    var hookFunc = this.infos.hooks? this.infos.hooks[name] : null;
    data = data || {};

    if (!hookFunc) return Q(data);

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


// Install a list of plugin
Plugin.install = function(options) {
    // Normalize list of plugins
    var plugins = Plugin.normalizeList(options.plugins);

    // Install plugins one by one
    return _.reduce(plugins, function(prev, plugin) {
        return prev.then(function() {
            var fullname = "gitbook-plugin-"+plugin.name;
            console.log("Install plugin", plugin.name, "from npm ("+fullname+") with version", (plugin.version || "*"));
            return Q.nfcall(npmi, {
                'name': fullname,
                'version': plugin.version,
                'path': options.input,
                'npmLoad': {
                    'loglevel': 'silent',
                    'loaded': false,
                    'prefix': options.input
                }
            });
        });
    }, Q());
};

// Normalize a list of plugins to use
Plugin.normalizeList = function(plugins) {
    // Normalize list to an array
    plugins = _.isString(plugins) ? plugins.split(",") : (plugins || []);

    // Divide as {name, version} to handle format like "myplugin@1.0.0"
    plugins = _.map(plugins, function(plugin) {
        var parts = plugin.split("@");
        return {
            'name': parts[0],
            'version': parts[1] // optional
        }
    });

    // List plugins to remove
    var toremove = _.chain(plugins)
    .filter(function(plugin) {
        return plugin.name.length > 0 && plugin.name[0] == "-";
    })
    .map(function(plugin) {
        return plugin.name.slice(1);
    })
    .value();

    // Merge with defaults
    plugins = _.chain(plugins)
    .concat(_.map(Plugin.defaults, function(plugin) {
        return { 'name': plugin }
    }))
    .uniq()
    .value();

    // Build final list
    plugins = _.filter(plugins, function(plugin) {
        return !_.contains(toremove, plugin.name) && !(plugin.name.length > 0 && plugin.name[0] == "-");
    });

    return plugins;
};

// Normalize a list of plugin name to use
Plugin.normalizeNames = function(plugins) {
    return _.pluck(Plugin.normalizeList(plugins), "name");
};

// Extract data from a list of plugin
Plugin.fromList = function(names, root, generator, options) {
    options = _.defaults(options || {}, {
        assetsBase: "book"
    });

    var failed = [];

    // Load plugins
    var plugins = _.map(names, function(name) {
        var plugin = new Plugin(name, root, generator);
        if (!plugin.isValid()) failed.push(name);
        return plugin;
    });

    if (_.size(failed) > 0) return Q.reject(new Error("Error loading plugins: "+failed.join(",")+". Run 'gitbook install' to install plugins from NPM."));

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
        return _.chain(RESOURCES)
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

// Default plugins added to each books
Plugin.defaults = [
    "mathjax"
];

module.exports = Plugin;
