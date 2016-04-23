var path = require('path');
var crc = require('crc');

var editHTMLElement = require('./editHTMLElement');
var fs = require('../../utils/fs');
var location = require('../../utils/location');

/**
    Fetch all remote images

    @param {String} rootFolder
    @param {HTMLDom} $
    @return {Promise}
*/
function fetchRemoteImages(rootFolder, $) {
    return editHTMLElement($, 'img', function($img) {
        var src = $img.attr('src');
        var extension = path.extname(src);

        if (!location.isExternal(src)) {
            return;
        }

        // We avoid generating twice the same PNG
        var hash = crc.crc32(src).toString(16);
        var fileName = hash + extension;
        var filePath = path.join(rootFolder, fileName);

        return fs.assertFile(filePath, function() {
            return fs.download(src, filePath);
        })
        .then(function() {
            $img.replaceWith('<img src="/' + fileName + '" />');
        });
    });
}

module.exports = fetchRemoteImages;
