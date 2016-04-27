var Immutable = require('immutable');

/**
    List blocks from a list of plugins

    @param {OrderedMap<String:Plugin>}
    @return {Map<String:TemplateBlock>}
*/
function listBlocks(plugins) {
    return plugins
        .reverse()
        .reduce(function(result, plugin) {
            return result.merge(plugin.getBlocks());
        }, Immutable.Map());
}

module.exports = listBlocks;
