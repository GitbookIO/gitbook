const path = require('path');
const url = require('url');

const LocationUtils = require('../../utils/location');
const editHTMLElement = require('./editHTMLElement');

/**
    Resolve all HTML links:
        - /test.md in hello -> ../test.html

    @param {String} currentFile
    @param {Function(String) -> String} resolveFile
    @param {HTMLDom} $
*/
function resolveLinks(currentFile, resolveFile, $) {
    const currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'a', function($a) {
        let href = $a.attr('href');

        // Don't change a tag without href
        if (!href) {
            return;
        }

        if (LocationUtils.isExternal(href)) {
            $a.attr('target', '_blank');
            return;
        }

        // Split anchor
        const parsed = url.parse(href);
        href = parsed.pathname || '';

        if (href) {
            // Calcul absolute path for this
            href = LocationUtils.toAbsolute(href, currentDirectory, '.');

            // Resolve file
            href = resolveFile(href);

            // Convert back to relative
            href = LocationUtils.relative(currentDirectory, href);
        }

        // Add back anchor
        href = href + (parsed.hash || '');

        $a.attr('href', href);
    });
}

module.exports = resolveLinks;
