const Promise = require('../../utils/promise');
const copyPluginAssets = require('./copyPluginAssets');

/**
 * Initialize the generator
 *
 * @param {Output}
 * @return {Output}
 */
function onInit(output) {
    return Promise(output)
    .then(copyPluginAssets);
}

module.exports = onInit;
