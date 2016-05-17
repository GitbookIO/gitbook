var Promise = require('../utils/promise');

/**
    Output all assets using a generator

    @param {Generator} generator
    @param {Output} output
    @return {Promise<Output>}
*/
function generateAssets(generator, output) {
    var assets = output.getAssets();
    var logger = output.getLogger();

    // Is generator ignoring assets?
    if (!generator.onAsset) {
        return Promise(output);
    }

    return Promise.reduce(assets, function(out, assetFile) {
        logger.debug.ln('copy asset "' + assetFile + '"');

        return generator.onAsset(out, assetFile);
    }, output);
}

module.exports = generateAssets;
