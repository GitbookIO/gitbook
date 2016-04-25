var nunjucks = require('nunjucks');
var Immutable = require('immutable');

var TemplateEngine = Immutable.Record({
    // List of {TemplateBlock}
    blocks:     Immutable.List(),

    // Map of filters: {String} name -> {Function} fn
    filters:    Immutable.Map(),

    // Map of globals: {String} name -> {Mixed}
    globals:    Immutable.Map(),

    // Context for filters / blocks
    context:    Object(),

    // Nunjucks loader
    loader:     nunjucks.FileSystemLoader('views')
}, 'TemplateEngine');

TemplateEngine.prototype.getBlocks = function() {
    return this.get('blocks');
};

TemplateEngine.prototype.getGlobals = function() {
    return this.get('globals');
};

TemplateEngine.prototype.getFilters = function() {
    return this.get('filters');
};

TemplateEngine.prototype.getShortcuts = function() {
    return this.get('shortcuts');
};

TemplateEngine.prototype.getLoader = function() {
    return this.get('loader');
};

TemplateEngine.prototype.getContext = function() {
    return this.get('context');
};

/**
    Return a nunjucks environment from this configuration

    @return {Nunjucks.Environment}
*/
TemplateEngine.prototype.toNunjucks = function() {
    var that = this;
    var loader = this.getLoader();
    var blocks = this.getBlocks();
    var filters = this.getFilters();
    var globals = this.getGlobals();

    var env = new nunjucks.Environment(
        loader,
        {
            // Escaping is done after by the asciidoc/markdown parser
            autoescape: false,

            // Syntax
            tags: {
                blockStart: '{%',
                blockEnd: '%}',
                variableStart: '{{',
                variableEnd: '}}',
                commentStart: '{###',
                commentEnd: '###}'
            }
        }
    );

    // Add filters
    filters.forEach(function(filterFn, filterName) {
        env.addFilter(filterName, that.bindToContext(filterFn));
    });

    // Add blocks
    blocks.forEach(function(block) {
        var extName = block.getExtensionName();
        var Ext = block.toNunjucksExt();

        env.addExtension(extName, new Ext());
    });

    // Add globals
    globals.forEach(function(globalName, globalValue) {
        env.addGlobal(globalName, globalValue);
    });

    return env;
};

/**
    Bind a function to the context

    @param {Function} fn
    @return {Function}
*/
TemplateEngine.prototype.bindToContext = function(fn) {
    return fn.bind(this.getContext());
};

module.exports = TemplateEngine;
