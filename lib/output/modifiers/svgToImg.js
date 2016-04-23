var path = require('path');
var domSerializer = require('dom-serializer');

var editHTMLElement = require('./editHTMLElement');
var fs = require('../../utils/fs');

/**
    Render a cheerio DOM as html

    @param {HTMLDom} $
    @param {HTMLElement} dom
    @param {Object}
    @return {String}
*/
function renderDOM($, dom, options) {
    if (!dom && $._root && $._root.children) {
        dom = $._root.children;
    }
    options = options|| dom.options || $._options;
    return domSerializer(dom, options);
}

/**
    Replace SVG tag by IMG

    @param {String} baseFolder
    @param {HTMLDom} $
*/
function svgToImg(baseFolder, $) {
    return editHTMLElement($, 'svg', function($svg) {
        var content = '<?xml version="1.0" encoding="UTF-8"?>' +
            renderDOM($, $svg);

        // Generate a filename
        return fs.uniqueFilename(baseFolder, 'image.svg')
        .then(function(fileName) {
            var filePath = path.join(baseFolder, fileName);

            // Write the svg to the file
            return fs.writeFile(filePath, content, 'utf8')

            // Return as image
            .then(function() {
                $svg.replaceWith('<img src="/' + fileName + '" />');
            });
        });
    });
}

module.exports = svgToImg;
