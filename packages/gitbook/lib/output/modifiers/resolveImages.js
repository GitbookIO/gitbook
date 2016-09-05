var path = require('path');

var LocationUtils = require('../../utils/location');
var editHTMLElement = require('./editHTMLElement');

/**
    Resolve all HTML images:
        - /test.png in hello -> ../test.html

    @param {String} currentFile
    @param {HTMLDom} $
*/
function resolveImages(currentFile, $) {
    var currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'img', function($img) {
        var src = $img.attr('src');

        if (LocationUtils.isExternal(src) || LocationUtils.isDataURI(src)) {
            return;
        }

        // Calcul absolute path for this
        src = LocationUtils.toAbsolute(src, currentDirectory, '.');

        // Convert back to relative
        src = LocationUtils.relative(currentDirectory, src);

        $img.attr('src', src);
    });
}

module.exports = resolveImages;
