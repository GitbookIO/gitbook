const crc = require('crc');
const path = require('path');

const imagesUtil = require('../../utils/images');
const fs = require('../../utils/fs');
const LocationUtils = require('../../utils/location');

const editHTMLElement = require('./editHTMLElement');

/**
 * Convert all inline PNG images to PNG file
 *
 * @param {String} rootFolder
 * @param {HTMLDom} $
 * @return {Promise}
 */
function inlinePng(rootFolder, currentFile, $) {
    const currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'img', function($img) {
        const src = $img.attr('src');
        if (!LocationUtils.isDataURI(src)) {
            return;
        }

        // We avoid generating twice the same PNG
        const hash = crc.crc32(src).toString(16);
        let fileName = hash + '.png';

        // Result file path
        const filePath = path.join(rootFolder, fileName);

        return fs.assertFile(filePath, function() {
            return imagesUtil.convertInlinePNG(src, filePath);
        })
        .then(function() {
            // Convert filename to a relative filename
            fileName = LocationUtils.relative(currentDirectory, fileName);

            // Replace src
            $img.attr('src', fileName);
        });
    });
}

module.exports = inlinePng;
