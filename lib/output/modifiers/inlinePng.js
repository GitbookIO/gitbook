var crc = require('crc');
var path = require('path');

var imagesUtil = require('../../utils/images');
var fs = require('../../utils/fs');
var LocationUtils = require('../../utils/location');

var editHTMLElement = require('./editHTMLElement');

/**
    Convert all inline PNG images to PNG file

    @param {String} rootFolder
    @param {HTMLDom} $
    @return {Promise}
*/
function inlinePng(rootFolder, currentFile, $) {
    var currentDirectory = path.dirname(currentFile);

    return editHTMLElement($, 'img', function($img) {
        var src = $img.attr('src');
        if (!LocationUtils.isDataURI(src)) {
            return;
        }

        // We avoid generating twice the same PNG
        var hash = crc.crc32(src).toString(16);
        var fileName = hash + '.png';

        // Result file path
        var filePath = path.join(rootFolder, fileName);

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
