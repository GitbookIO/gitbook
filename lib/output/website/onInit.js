var Promise = require('../../utils/promise');

var copyPluginAssets = require('./copyPluginAssets');
var prepareI18n = require('./prepareI18n');

/**
    Initialize the generator

    @param {Output}
    @return {Output}
*/
function onInit(output) {
    return Promise(output)
    .then(prepareI18n)
    .then(copyPluginAssets);
}

module.exports = onInit;
