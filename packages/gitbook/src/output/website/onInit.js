const Promise = require('../../utils/promise');

const copyPluginAssets = require('./copyPluginAssets');
const prepareI18n = require('./prepareI18n');
const prepareResources = require('./prepareResources');

/**
    Initialize the generator

    @param {Output}
    @return {Output}
*/
function onInit(output) {
    return Promise(output)
    .then(prepareI18n)
    .then(prepareResources)
    .then(copyPluginAssets);
}

module.exports = onInit;
