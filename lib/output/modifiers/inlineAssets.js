var svgToImg = require('./svgToImg');
var svgToPng = require('./svgToPng');
var fetchRemoteImages = require('./fetchRemoteImages');

var Promise = require('../../utils/promise');

/**
    Inline all assets in a page

    @param {String} rootFolder
*/
function inlineAssets(rootFolder) {
    return function($) {
        return Promise()
        .then(fetchRemoteImages.bind(null, rootFolder))
        .then(svgToImg.bind(null, rootFolder))
        .then(svgToPng.bind(null, rootFolder));
    };
}

module.exports = inlineAssets;
