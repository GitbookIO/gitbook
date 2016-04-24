var Immutable = require('immutable');
var TemplateEngine = require('../models/templateEngine');

/**
    Create template engine for an output.
    It adds default filters/blocks, then add the ones from plugins

    @param {Output} output
    @return {TemplateEngine}
*/
function createTemplateEngine(output) {
    var plugins = output.getPlugins();

    var filters = plugins
        .reduce(function(result, plugin) {
            return result.merge(plugin.getFilters());
        }, Immutable.Map());

    var blocks = plugins
        .map(function(plugin) {
            return plugin.getBlocks();
        })
        .flatten();

    return new TemplateEngine({
        filters: filters,
        blocks: blocks
    });
}

module.exports = createTemplateEngine;
