var _ = require('lodash');
var util = require('util');
var path = require('path');

var FolderOutput = require('./folder');
var Promise = require('../utils/promise');
var fs = require('../utils/fs');
var imagesUtil = require('../utils/images');
var location = require('../utils/location');

var DEFAULT_ASSETS_FOLDER = 'assets';

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
AssetsInliner.prototype.onOutputImage = function(page, src) {
    var that = this;
    var isSVG = false;
    var ext = path.extname(src).toLowerCase();
    if (ext == '.svg') {
        isSVG = false;
        ext = '.png';
    }

    return Promise()

    // Allocate a new file
    .then(function() {

        return that.
    })

    // Download file if external
    .then(function() {
        if (!location.isExternal(src)) return;

        return fs.download(src, )

    })
    .then(function() {
        if (path.extname(src).toLowerCase() != '.svg') {
            return src;
        }

        // Convert SVG to PNG
        var filename = _.uniqueId('svg_') + '.png';
        return imagesUtil.convertSVGToPNG(page.resolve(src), this.resolve(filename))
            .thenResolve('/' + filename);
    })

    // Return relative path from the page
    .thenResolve(function(filename) {
        return page.relative('/' + filename);
    });
};


module.exports = AssetsInliner;
