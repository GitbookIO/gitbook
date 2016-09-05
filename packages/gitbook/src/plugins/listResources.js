const Immutable = require('immutable');
const path = require('path');

const LocationUtils = require('../utils/location');
const PLUGIN_RESOURCES = require('../constants/pluginResources');

/**
    List all resources from a list of plugins

    @param {OrderedMap<String:Plugin>}
    @param {String} type
    @return {Map<String:List<{url, path}>}
*/
function listResources(plugins, resources) {
    return plugins.reduce(function(result, plugin) {
        const npmId           = plugin.getNpmID();
        const pluginResources = resources.get(plugin.getName());

        PLUGIN_RESOURCES.forEach(function(resourceType) {
            let assets = pluginResources.get(resourceType);
            if (!assets) return;

            let list = result.get(resourceType) || Immutable.List();

            assets = assets.map(function(assetFile) {
                if (LocationUtils.isExternal(assetFile)) {
                    return {
                        url: assetFile
                    };
                } else {
                    return {
                        path: LocationUtils.normalize(path.join(npmId, assetFile))
                    };
                }
            });

            list = list.concat(assets);
            result = result.set(resourceType, list);
        });

        return result;
    }, Immutable.Map());
}

module.exports = listResources;
