var path = require('path');

var LocationUtils = require('../../utils/location');
var editHTMLElement = require('./editHTMLElement');

/**
    Resolve all HTML links:
        - /test.md in hello -> ../test.html

    @param {String} currentFile
    @param {Function(String) -> String} resolveFile
    @param {HTMLDom} $
*/
function resolveLinks(currentFile, resolveFile, $) {
    var currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'a', function($a) {
        var href = $a.attr('href');

        if (location.isExternal(href)) {
            $a.attr('_target', 'blank');
            return;
        }

        // Calcul absolute path for this
        href = LocationUtils.toAbsolute(href, currentDirectory, currentDirectory);

        // Resolve file
        href = resolveFile(href);

        // Convert back to relative
        href = LocationUtils.relative(currentDirectory, href);

        $a.attr('href', href);
    });
}

module.exports = resolveLinks;
