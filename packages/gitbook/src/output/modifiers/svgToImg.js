const path = require('path');
const crc = require('crc');
const domSerializer = require('dom-serializer');

const editHTMLElement = require('./editHTMLElement');
const fs = require('../../utils/fs');
const LocationUtils = require('../../utils/location');

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
    options = options || dom.options || $._options;
    return domSerializer(dom, options);
}

/**
    Replace SVG tag by IMG

    @param {String} baseFolder
    @param {HTMLDom} $
*/
function svgToImg(baseFolder, currentFile, $) {
    const currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'svg', function($svg) {
        const content = '<?xml version="1.0" encoding="UTF-8"?>' +
            renderDOM($, $svg);

        // We avoid generating twice the same PNG
        const hash = crc.crc32(content).toString(16);
        const fileName = hash + '.svg';
        const filePath = path.join(baseFolder, fileName);

        // Write the svg to the file
        return fs.assertFile(filePath, function() {
            return fs.writeFile(filePath, content, 'utf8');
        })

        // Return as image
        .then(function() {
            const src = LocationUtils.relative(currentDirectory, fileName);
            $svg.replaceWith('<img src="' + src + '" />');
        });
    });
}

module.exports = svgToImg;
