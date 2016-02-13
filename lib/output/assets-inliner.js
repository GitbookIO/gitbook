var _ = require('lodash');
var util = require('util');
var path = require('path');

var FolderOutput = require('./folder');
var imagesUtil = require('../utils/images');

/*
Utility mixin to inline all the assets in a book:
    - Outline <svg> tags
    - Convert svg images as png
    - Download remote images
*/

function AssetsInliner() {
    FolderOutput.apply(this, arguments);
}
util.inherits(AssetsInliner, FolderOutput);

// Output a SVG buffer as a file
AssetsInliner.prototype.onOutputSVG = function(page, svg) {
    this.log.debug.ln('output svg from', page.path);
    var filename = _.uniqueId('svg_') + '.png';

    // Convert svg buffer to a png file
    return imagesUtil.convertSVGBufferToPNG(svg, this.resolve(filename))

        // Return relative path from the page
        .thenResolve(function() {
            return page.relative('/' + filename);
        });
};

// Output an image as a file
AssetsInliner.prototype.onOutputImage = function(page, imgFile) {
    if (path.extname(imgFile).toLowerCase() != '.svg') {
        return imgFile;
    }

    // Convert SVG to PNG
    var filename = _.uniqueId('svg_') + '.png';
    return imagesUtil.convertSVGToPNG(page.resolve(imgFile), this.resolve(filename))

        // Return relative path from the page
        .thenResolve(function() {
            return page.relative('/' + filename);
        });
};


module.exports = AssetsInliner;
