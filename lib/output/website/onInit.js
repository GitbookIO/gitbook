var path = require('path');

var ASSET_FOLDER = require('../../constants/pluginAssetsFolder');
var Promise = require('../../utils/promise');
var fs = require('../../utils/fs');

/**
    Initialize the generator
*/
function onInit(output) {
    return Promise(output)
    .then(copyPluginAssets)
    .thenResolve(output);
}


/**
    Copy all assets from plugins

    @param {Output}
    @return {Promise}
*/
function copyPluginAssets(output) {
    var options = output.getOptions();
    var plugins = output.getPlugins();
    var logger = output.getLogger();

    var outputRoot = options.get('root');
    var assetOutputFolder = path.join(outputRoot, 'gitbook');
    var prefix = options.get('prefix');

    return Promise.forEach(plugins, function(plugin) {
        var pluginRoot = plugin.getPath();
        var assetFolder = path.join(pluginRoot, ASSET_FOLDER, prefix);

        if (!fs.existsSync(assetFolder)) {
            return;
        }

        logger.debug.ln('copy assets from theme', assetFolder);
        return fs.copyDir(
            assetFolder,
            assetOutputFolder,
            {
                deleteFirst: false,
                overwrite: true,
                confirm: true
            }
        );
    });
}

module.exports = onInit;
