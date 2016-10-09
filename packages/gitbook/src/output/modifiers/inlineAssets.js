const svgToImg = require('./svgToImg');
const svgToPng = require('./svgToPng');
const inlinePng = require('./inlinePng');
const resolveImages = require('./resolveImages');
const fetchRemoteImages = require('./fetchRemoteImages');

const Promise = require('../../utils/promise');

/**
 * Inline all assets in a page
 *
 * @param {String} rootFolder
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
