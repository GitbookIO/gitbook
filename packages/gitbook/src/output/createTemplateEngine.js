const Templating = require('../templating');
const TemplateEngine = require('../models/templateEngine');

const Api = require('../api');
const Plugins = require('../plugins');

const defaultBlocks = require('../constants/defaultBlocks');
const defaultFilters = require('../constants/defaultFilters');

/**
 * Create template engine for an output.
 * It adds default filters/blocks, then add the ones from plugins
 *
 * @param {Output} output
 * @return {TemplateEngine}
 */
function createTemplateEngine(output) {
    const plugins = output.getPlugins();
    const book = output.getBook();
    const rootFolder = book.getContentRoot();
    const logger = book.getLogger();

    let filters = Plugins.listFilters(plugins);
    let blocks = Plugins.listBlocks(plugins);

    // Extend with default
    blocks = defaultBlocks.merge(blocks);
    filters = defaultFilters.merge(filters);

    // Create loader
    const transformFn = Templating.replaceShortcuts.bind(null, blocks);
    const loader = new Templating.ConrefsLoader(rootFolder, transformFn, logger);

    // Create API context
    const context = Api.encodeGlobal(output);

    return new TemplateEngine({
        filters,
        blocks,
        loader,
        context
    });
}

module.exports = createTemplateEngine;
