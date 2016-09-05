var Templating = require('../templating');
var TemplateEngine = require('../models/templateEngine');

var Api = require('../api');
var Plugins = require('../plugins');

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
    var book = output.getBook();
    var rootFolder = book.getContentRoot();
    var logger = book.getLogger();

    var filters = Plugins.listFilters(plugins);
    var blocks = Plugins.listBlocks(plugins);

    // Extend with default
    blocks = defaultBlocks.merge(blocks);
    filters = defaultFilters.merge(filters);

    // Create loader
    var transformFn = Templating.replaceShortcuts.bind(null, blocks);
    var loader = new Templating.ConrefsLoader(rootFolder, transformFn, logger);

    // Create API context
    var context = Api.encodeGlobal(output);

    return new TemplateEngine({
        filters:    filters,
        blocks:     blocks,
        loader:     loader,
        context:    context
    });
}

module.exports = createTemplateEngine;
