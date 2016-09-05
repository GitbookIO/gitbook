var crc = require('crc');
var path = require('path');

var imagesUtil = require('../../utils/images');
var fs = require('../../utils/fs');
var LocationUtils = require('../../utils/location');

var editHTMLElement = require('./editHTMLElement');

/**
    Convert all SVG images to PNG

    @param {String} rootFolder
    @param {HTMLDom} $
    @return {Promise}
*/
function svgToPng(rootFolder, currentFile, $) {
    var currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'img', function($img) {
        var src = $img.attr('src');
        if (path.extname(src) !== '.svg') {
            return;
        }

        // Calcul absolute path for this
        src = LocationUtils.toAbsolute(src, currentDirectory, '.');

        // We avoid generating twice the same PNG
        var hash = crc.crc32(src).toString(16);
        var fileName = hash + '.png';

        // Input file path
        var inputPath = path.join(rootFolder, src);

        // Result file path
        var filePath = path.join(rootFolder, fileName);

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
