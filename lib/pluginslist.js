var _ = require('lodash');
var Q = require('q');
var npmi = require('npmi');
var npm = require('npm');
var semver = require('semver');

var Plugin = require('./plugin');
var version = require('./version');

var initNPM = _.memoize(function() {
    return Q.nfcall(npm.load, { silent: true, loglevel: 'silent' });
});


var PluginsList = function(book, plugins) {
    this.book = book;
    this.log = this.book.log;

    // List of Plugin objects
    this.list = [];

    // List of names of failed plugins
    this.failed = [];

    // Namespaces
    this.namespaces = _.chain(['website', 'ebook'])
        .map(function(namespace) {
            return [
                namespace,
                {
                    html: {},
                    resources: _.chain(Plugin.RESOURCES)
                        .map(function(type) {
                            return [type, []];
                        })
                        .object()
                        .value()
                }
            ];
        })
        .object()
        .value();

    // Bind methods
    _.bindAll(this);

    if (plugins) this.load(plugins);
};

// return count of plugins
PluginsList.prototype.count = function() {
    return this.list.length;
};

// Add and load a plugin
PluginsList.prototype.load = function(plugin) {
    var that = this;

    if (_.isArray(plugin)) {
        return _.reduce(plugin, function(prev, p) {
            return prev.then(function() {
                return that.load(p);
            });
        }, Q());
    }
    if (_.isObject(plugin) && !(plugin instanceof Plugin)) plugin = plugin.name;
    if (_.isString(plugin)) plugin = new Plugin(this.book, plugin);

    that.log.info('load plugin', plugin.name, '....');
    if (!plugin.isValid()) {
        that.log.info.fail();
        that.failed.push(plugin.name);
        return Q();
    } else {
        that.log.info.ok();

        // Push in the list
        that.list.push(plugin);
    }

    return Q()

    // Validate and normalize configuration
    .then(function() {
        var config = plugin.getConfig();
        return plugin.validateConfig(config);
    })
    .then(function(config) {
        // Update configuration
        plugin.setConfig(config);

        // Extract filters
        that.book.template.addFilters(plugin.getFilters());

        // Extract blocks
        that.book.template.addBlocks(plugin.getBlocks());

        return _.reduce(_.keys(that.namespaces), function(prev, namespaceName) {
            return prev.then(function() {
                return plugin.getResources(namespaceName)
                .then(function(plResources) {
                    var namespace = that.namespaces[namespaceName];

                    // Extract js and css
                    _.each(Plugin.RESOURCES, function(resourceType) {
                        namespace.resources[resourceType] = (namespace.resources[resourceType] || []).concat(plResources[resourceType] || []);
                    });

                    // Map of html resources by name added by each plugin
                    _.each(plResources.html || {}, function(value, tag) {
                        // Turn into function if not one already
                        if (!_.isFunction(value)) value = _.constant(value);

                        namespace.html[tag] = namespace.html[tag] || [];
                        namespace.html[tag].push(value);
                    });
                });
            });
        }, Q());
    });
};

// Call a hook
PluginsList.prototype.hook = function(name, data) {
    return _.reduce(this.list, function(prev, plugin) {
        return prev.then(function(ret) {
            return plugin.callHook(name, ret);
        });
    }, Q(data));
};

// Return a template from a plugin
PluginsList.prototype.template = function(name) {
    var withTpl = _.find(this.list, function(plugin) {
        return (
            plugin.infos.templates &&
            plugin.infos.templates[name]
        );
    });

    if (!withTpl) return null;
    return withTpl.resolveFile(withTpl.infos.templates[name]);
};

// Return an html snippet
PluginsList.prototype.html = function(namespace, tag, context, options) {
    var htmlSnippets = this.namespaces[namespace].html[tag];
    return _.map(htmlSnippets || [], function(code) {
        return code.call(context, options);
    }).join('\n');
};

// Return a resources map for a namespace
PluginsList.prototype.resources = function(namespace) {
    return this.namespaces[namespace].resources;
};

// Install plugins from a book
PluginsList.prototype.install = function() {
    var that = this;

    // Remove defaults (no need to install)
    var plugins = _.reject(that.book.options.plugins, {
        isDefault: true
    });

    // Install plugins one by one
    that.book.log.info.ln(plugins.length+' plugins to install');
    return _.reduce(plugins, function(prev, plugin) {
        return prev.then(function() {
            var fullname = 'gitbook-plugin-'+plugin.name;

            return Q()

            // Resolve version if needed
            .then(function() {
                if (plugin.version) return plugin.version;

                that.book.log.info.ln('No version specified, resolve plugin', plugin.name);
                return initNPM()
                .then(function() {
                    return Q.nfcall(npm.commands.view, [fullname+'@*', 'engines'], true);
                })
                .then(function(versions) {
                    return _.chain(versions)
                        .pairs()
                        .map(function(v) {
                            return {
                                version: v[0],
                                gitbook: (v[1].engines || {}).gitbook
                            };
                        })
                        .filter(function(v) {
                            return v.gitbook && version.satisfies(v.gitbook);
                        })
                        .sort(function(v1, v2) {
                            return semver.lt(v1.version, v2.version)? 1 : -1;
                        })
                        .pluck('version')
                        .first()
                        .value();
                });
            })

            // Install the plugin with the resolved version
            .then(function(version) {
                if (!version) {
                    throw 'Found no satisfactory version for plugin '+plugin.name;
                }

                that.book.log.info.ln('install plugin', plugin.name, 'from npm ('+fullname+') with version', version);
                return Q.nfcall(npmi, {
                    'name': fullname,
                    'version': version,
                    'path': that.book.root,
                    'npmLoad': {
                        'loglevel': 'silent',
                        'loaded': true,
                        'prefix': that.book.root
                    }
                });
            })
            .then(function() {
                that.book.log.info.ok('plugin', plugin.name, 'installed with success');
            });
        });
    }, Q());
};

module.exports = PluginsList;
