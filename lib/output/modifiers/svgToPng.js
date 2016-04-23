var crc = require('crc');
var path = require('path');

var imagesUtil = require('../../utils/images');
var fs = require('../../utils/fs');

var editHTMLElement = require('./editHTMLElement');

/**
    Convert all SVG images to PNG

    @param {String} rootFolder
    @param {HTMLDom} $
    @return {Promise}
*/
function svgToPng(rootFolder, $) {
    return editHTMLElement($, 'img', function($img) {
        var src = $img.attr('src');
        if (path.extname(src) !== '.svg') {
            return;
        }

        // We avoid generating twice the same PNG
        var hash = crc.crc32(src).toString(16);
        var fileName = hash + '.png';
        var filePath = path.join(rootFolder, fileName);

        return fs.assertFile(filePath, function() {
            return imagesUtil.convertSVGToPNG(src, filePath);
        })
        .then(function() {
            $img.replaceWith('<img src="/' + fileName + '" />');
        });
    });
}


module.exports = svgToPng;
