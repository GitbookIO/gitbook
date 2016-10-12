const { Map } = require('immutable');

/**
 * List blocks from a list of plugins
 *
 * @param {OrderedMap<String:Plugin>}
 * @return {Map<String:TemplateBlock>}
 */
function listBlocks(plugins) {
    return plugins
        .reverse()
        .reduce(
            (result, plugin) => {
                const blocks = plugin.getBlocks();
                return result.merge(blocks);
            },
            Map()
        );
}

module.exports = listBlocks;
