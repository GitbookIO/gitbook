var _ = require("lodash");
var Q = require("q");

var Plugin = require("./plugin");

var PluginsList = function(book, plugins) {
	this.book = book;
	this.log = this.book.log;

	// List of Plugin objects
	this.plugins = [];

	// List of names of failed plugins
	this.failed = [];

	// List of plugins resources
	this.resources = {};
	_.each(Plugin.RESOURCES, function(resourceType) {
		this.resources[resourceType] = [];
	}, this);

	// Map of html snippets
	this.htmlSnippets = {};

	// Bind methods
	_.bindAll(this);

	if (plugins) this.load(plugins);
};

// return count of plugins
PluginsList.prototype.count = function() {
	return this.plugins.length;
};

// Add and load a plugin
PluginsList.prototype.load = function(plugin, options) {
	var that = this;
	options = _.defaults(options || {}, {
        assetsBase: "book"
    });

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
    	that.plugins.push(plugin);
    }

	// Extract filters
	_.each(plugin.getFilters(), function(filterFunc, filterName) {
        that.book.template.addFilter(filterName, filterFunc);
    });

    // Extract blocks
	_.each(plugin.getBlocks(), function(block, blockName) {
        that.book.template.addBlock(blockName, block);
    });

	return Q()
	.then(function() {
		return plugin.getResources(options.assetsBase);
	})

	.then(function(plResources) {
		// Extract js and css
		_.each(Plugin.RESOURCES, function(resourceType) {
			that.resources[resourceType].concat(plResources[resourceType] || []);
		});

        // Map of html resources by name added by each plugin
        _.each(plResources.html || {}, function(value, tag) {
        	// Turn into function if not one already
           	if (!_.isFunction(value)) value = _.constant(value);

        	that.htmlSnippets[tag] = that.htmlSnippets[tag] || [];
        	that.htmlSnippets[tag].push(value);
        });
    });
};

// Call a hook
PluginsList.prototype.hook = function(name, data) {
	return _.reduce(this.plugins, function(prev, plugin) {
        return prev.then(function(ret) {
            return plugin.callHook(name, ret);
        });
    }, Q(data));
};

// Return a template from a plugin
PluginsList.prototype.template = function(name) {
	var withTpl = _.find(this.plugins, function(plugin) {
        return (
            plugin.infos.templates &&
            plugin.infos.templates[name]
        );
    });

    if (!withTpl) return null;
    return withTpl.resolveFile(withTpl.infos.templates[name]);
};

// Return an html snippet
PluginsList.prototype.html = function(tag, context, options) {
    return _.map(this.htmlSnippets[tag] || [], function(code) {
        return code.call(context, options);
    }).join("\n");
};

module.exports = PluginsList;
