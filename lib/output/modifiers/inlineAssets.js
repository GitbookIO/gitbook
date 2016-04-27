var svgToImg = require('./svgToImg');
var svgToPng = require('./svgToPng');
var fetchRemoteImages = require('./fetchRemoteImages');

var Promise = require('../../utils/promise');

/**
    Inline all assets in a page

    @param {String} rootFolder
*/
function inlineAssets(rootFolder, currentFile) {
    return function($) {
        return Promise()
        .then(fetchRemoteImages.bind(null, rootFolder, currentFile))
        .then(svgToImg.bind(null, rootFolder, currentFile))
        .then(svgToPng.bind(null, rootFolder, currentFile));
    };
}

module.exports = inlineAssets;
