var _ = require("lodash");
var Q = require("q");

var Plugin = require("./plugin");

var PluginsList = function(book, plugins) {
	this.book = book;
	this.log = this.book.log;

	// List of Plugin objects
	this.list = [];

	// List of names of failed plugins
	this.failed = [];

	// Namespaces
	this.namespaces = _.chain(["website", "ebook"])
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
PluginsList.prototype.load = function(plugin, options) {
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

	that.log.info("load plugin", plugin.name, "....");
	if (!plugin.isValid()) {
    	that.log.info.fail();
    	that.failed.push(plugin.name);
    	return Q();
    } else {
    	that.log.info.ok();

    	// Push in the list
    	that.list.push(plugin);
    }

	// Extract filters
	_.each(plugin.getFilters(), function(filterFunc, filterName) {
        that.book.template.addFilter(filterName, filterFunc);
    });

    // Extract blocks
	_.each(plugin.getBlocks(), function(block, blockName) {
        that.book.template.addBlock(blockName, block);
    });

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
			})
		});
	}, Q());
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
    }).join("\n");
};

// Return a resources map for a namespace
PluginsList.prototype.resources = function(namespace) {
	return this.namespaces[namespace].resources;
};

module.exports = PluginsList;
