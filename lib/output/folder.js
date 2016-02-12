var _ = require('lodash');
var util = require('util');
var path = require('path');

var Output = require('./base');
var fs = require('../utils/fs');
var pathUtil = require('../utils/path');
var Promise = require('../utils/promise');

/*
This output require the native fs module to output
book as a directory (mapping assets and pages)
*/

function FolderOutput() {
    Output.apply(this, arguments);
}
util.inherits(FolderOutput, Output);

// Copy an asset file (non-parsable), ex: images, etc
FolderOutput.prototype.onAsset = function(filename) {
    return this.copyFile(
        this.book.resolve(filename),
        filename
    );
};

// Prepare the generation by creating the output folder
FolderOutput.prototype.prepare = function() {
    return fs.mkdirp(this.root());
};


// ----- Utility methods -----

// Return path to the root folder
FolderOutput.prototype.root = function(filename) {
    return path.resolve(process.cwd(), this.book.config.get('output'));
};

// Resolve a file in the output directory
FolderOutput.prototype.resolve = function(filename) {
    return pathUtil.resolveInRoot.apply(null, [this.root()].concat(_.toArray(arguments)));
};

// Copy a file to the output
FolderOutput.prototype.copyFile = function(from, to) {
    var that = this;

    return Promise()
    .then(function() {
        to = that.resolve(to);

        return fs.copy(from, to);
    });
};

// Write a file/buffer to the output folder
FolderOutput.prototype.writeFile = function(filename, buf) {
    var that = this;

    return Promise()
    .then(function() {
        filename = that.resolve(filename);
        var folder = path.dirname(filename);

        // Ensure fodler exists
        return fs.mkdirp(folder);
    })

    // Write the file
    .then(function() {
        return fs.writeFile(filename, buf);
    });
};


module.exports = FolderOutput;
