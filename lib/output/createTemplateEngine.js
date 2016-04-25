var Immutable = require('immutable');

var TemplateEngine = require('../models/templateEngine');
var ConrefsLoader = require('./loaders/conrefs');

var defaultBlocks = require('../constants/defaultBlocks');
var defaultFilters = require('../constants/defaultFilters');

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
        .flatten(1);

    // Extend with default
    blocks = defaultBlocks.concat(blocks);
    filters = defaultFilters.merge(filters);

    var loader = new ConrefsLoader();

    return new TemplateEngine({
        filters: filters,
        blocks: blocks,
        loader: loader
    });
}

module.exports = createTemplateEngine;
