const path = require('path');

const ASSET_FOLDER = require('../../constants/pluginAssetsFolder');
const Promise = require('../../utils/promise');
const fs = require('../../utils/fs');

/**
 * Copy all assets from plugins.
 * Assets are files stored in a "_assets" of the plugin.
 *
 * @param {Output}
 * @return {Promise}
 */
function copyPluginAssets(output) {
    const book = output.getBook();

    // Don't copy plugins assets for language book
    // It'll be resolved to the parent folder
    if (book.isLanguageBook()) {
        return Promise(output);
    }

    const plugins = output.getPlugins()

    // We reverse the order of plugins to copy
    // so that first plugins can replace assets from other plugins.
    .reverse();

    return Promise.forEach(plugins, function(plugin) {
        return copyAssets(output, plugin)
        .then(() => copyResources(output, plugin))
        .then(() => copyBrowserJS(output, plugin));
    })
    .then(() => copyCoreJS(output))
    .thenResolve(output);
}

/**
 * Copy assets from a plugin
 *
 * @param {Plugin}
 * @return {Promise}
 */
function copyAssets(output, plugin) {
    const logger = output.getLogger();
    const pluginRoot = plugin.getPath();
    const options = output.getOptions();

    const outputRoot = options.get('root');
    const assetOutputFolder = path.join(outputRoot, 'gitbook');
    const prefix = options.get('prefix');

    const assetFolder = path.join(pluginRoot, ASSET_FOLDER, prefix);

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
 * Copy JS file for the plugin
 *
 * @param {Plugin}
 * @return {Promise}
 */
function copyBrowserJS(output, plugin) {
    const logger     = output.getLogger();
    const pluginRoot = plugin.getPath();
    const options    = output.getOptions();
    const outputRoot = options.get('root');

    let browserFile = plugin.getPackage().get('browser');

    if (!browserFile) {
        return Promise();
    }

    browserFile = path.join(pluginRoot, browserFile);
    const outputFile = path.join(outputRoot, 'gitbook/plugins', plugin.getName() + '.js');

    logger.debug.ln('copy browser JS file from plugin', browserFile);
    return fs.ensureFile(outputFile)
    .then(() => fs.copy(browserFile, outputFile));
}

/**
 * Copy JS file for gitbook-core
 *
 * @param {Plugin}
 * @return {Promise}
 */
function copyCoreJS(output) {
    const logger     = output.getLogger();
    const options    = output.getOptions();
    const outputRoot = options.get('root');

    const inputFile = require.resolve('gitbook-core/dist/gitbook.core.min.js');
    const outputFile = path.join(outputRoot, 'gitbook/core.js');

    logger.debug.ln('copy JS for gitbook-core');
    return fs.ensureFile(outputFile)
    .then(() => fs.copy(inputFile, outputFile));
}

/**
 * Copy resources from a plugin
 *
 * @param {Plugin}
 * @return {Promise}
 */
function copyResources(output, plugin) {
    const logger = output.getLogger();

    const options    = output.getOptions();
    const outputRoot = options.get('root');

    const state = output.getState();
    const resources = state.getResources();

    const pluginRoot      = plugin.getPath();
    const pluginResources = resources.get(plugin.getName());

    let assetsFolder = pluginResources.get('assets');
    const assetOutputFolder = path.join(outputRoot, 'gitbook', plugin.getNpmID());

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
