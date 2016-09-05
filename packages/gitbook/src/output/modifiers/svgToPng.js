const crc = require('crc');
const path = require('path');

const imagesUtil = require('../../utils/images');
const fs = require('../../utils/fs');
const LocationUtils = require('../../utils/location');

const editHTMLElement = require('./editHTMLElement');

/**
    Convert all SVG images to PNG

    @param {String} rootFolder
    @param {HTMLDom} $
    @return {Promise}
*/
function svgToPng(rootFolder, currentFile, $) {
    const currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'img', function($img) {
        let src = $img.attr('src');
        if (path.extname(src) !== '.svg') {
            return;
        }

        // Calcul absolute path for this
        src = LocationUtils.toAbsolute(src, currentDirectory, '.');

        // We avoid generating twice the same PNG
        const hash = crc.crc32(src).toString(16);
        let fileName = hash + '.png';

        // Input file path
        const inputPath = path.join(rootFolder, src);

        // Result file path
        const filePath = path.join(rootFolder, fileName);

        return fs.assertFile(filePath, function() {
            return imagesUtil.convertSVGToPNG(inputPath, filePath);
        })
        .then(function() {
            // Convert filename to a relative filename
            fileName = LocationUtils.relative(currentDirectory, fileName);

            // Replace src
            $img.attr('src', fileName);
        });
    });
}


module.exports = svgToPng;
