var path = require('path');

var ASSET_FOLDER = require('../../constants/pluginAssetsFolder');
var Promise = require('../../utils/promise');
var fs = require('../../utils/fs');

/**
    Initialize the generator
*/
function onInit(output) {
    return Promise(output)
    .then(copyAllPluginAssets)
    .thenResolve(output);
}


/**
    Copy all assets from plugins.
    Assets are files stored in "_assets"
    nd resources declared in the plugin itself.

    @param {Output}
    @return {Promise}
*/
function copyAllPluginAssets(output) {
    var plugins = output.getPlugins();

    return Promise.forEach(plugins, function(plugin) {
        return copyAssets(output, plugin)
        .then(function() {
            return copyResources(output, plugin);
        });
    });
}

/**
    Copy assets from a plugin

    @param {Plugin}
    @return {Promise}
*/
function copyAssets(output, plugin) {
    var logger = output.getLogger();
    var pluginRoot = plugin.getPath();
    var options = output.getOptions();

    var outputRoot = options.get('root');
    var assetOutputFolder = path.join(outputRoot, 'gitbook');
    var prefix = options.get('prefix');

    var assetFolder = path.join(pluginRoot, ASSET_FOLDER, prefix);

    if (!fs.existsSync(assetFolder)) {
        return Promise();
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
}

/**
    Copy resources from a plugin

    @param {Plugin}
    @return {Promise}
*/
function copyResources(output, plugin) {
    var logger = output.getLogger();

    var options = output.getOptions();
    var prefix = options.get('prefix');
    var outputRoot = options.get('root');

    var pluginRoot = plugin.getPath();
    var resources = plugin.getResources(prefix);

    var assetsFolder = resources.get('assets');
    var assetOutputFolder = path.join(outputRoot, 'gitbook', plugin.getNpmID());

    if (!assetsFolder) {
        return Promise();
    }

    // Resolve assets folder
    assetsFolder = path.resolve(pluginRoot, assetsFolder);
    if (!fs.existsSync(assetsFolder)) {
        logger.warn.ln('assets folder for plugin "' + plugin.getName() + '" doesn\'t exist');
        return Promise();
    }

    logger.debug.ln('copy resources from plugin', assetsFolder);

    return fs.copyDir(
        assetsFolder,
        assetOutputFolder,
        {
            deleteFirst: false,
            overwrite: true,
            confirm: true
        }
    );
}

module.exports = onInit;
