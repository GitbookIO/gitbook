var path = require('path');

var ASSET_FOLDER = require('../../constants/pluginAssetsFolder');
var Promise = require('../../utils/promise');
var fs = require('../../utils/fs');

/**
    Copy all assets from plugins.
    Assets are files stored in "_assets"
    nd resources declared in the plugin itself.

    @param {Output}
    @return {Promise}
*/
function copyPluginAssets(output) {
    var book = output.getBook();

    // Don't copy plugins assets for language book
    // It'll be resolved to the parent folder
    if (book.isLanguageBook()) {
        return Promise(output);
    }

    var plugins = output.getPlugins()

        // We reverse the order of plugins to copy
        // so that first plugins can replace assets from other plugins.
        .reverse();

    return Promise.forEach(plugins, function(plugin) {
        return copyAssets(output, plugin)
        .then(function() {
            return copyResources(output, plugin);
        });
    })
    .thenResolve(output);
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

    var options    = output.getOptions();
    var outputRoot = options.get('root');

    var state = output.getState();
    var resources = state.getResources();

    var pluginRoot      = plugin.getPath();
    var pluginResources = resources.get(plugin.getName());

    var assetsFolder = pluginResources.get('assets');
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

module.exports = copyPluginAssets;
