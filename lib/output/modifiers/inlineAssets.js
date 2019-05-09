var svgToImg = require('./svgToImg');
var svgToPng = require('./svgToPng');
var inlinePng = require('./inlinePng');
var resolveImages = require('./resolveImages');
var fetchRemoteImages = require('./fetchRemoteImages');

var Promise = require('../../utils/promise');

/**
    Inline all assets in a page

    @param {String} rootFolder
*/
function inlineAssets(rootFolder, currentFile) {
    return function($) {
        return Promise()

        // Resolving images and fetching external images should be
        // done before svg conversion
        .then(resolveImages.bind(null, currentFile, $))
        .then(fetchRemoteImages.bind(null, rootFolder, currentFile, $))

        .then(svgToImg.bind(null, rootFolder, currentFile, $))
        .then(svgToPng.bind(null, rootFolder, currentFile, $))
        .then(inlinePng.bind(null, rootFolder, currentFile, $));
    };
}

module.exports = inlineAssets;
