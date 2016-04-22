var path = require('path');
var Immutable = require('immutable');

var parsers = require('../parsers');

var File = Immutable.Record({
    // Path of the file, relative to the FS
    path:       String(),

    // Time when file data last modified
    mtime:      Date()
});

File.prototype.getPath = function() {
    return this.get('path');
};

File.prototype.getMTime = function() {
    return this.get('mtime');
};

/**
    Return extension of this file (lowercased)

    @return {String}
*/
File.prototype.getExtension = function() {
    return path.extname(this.getPath()).toLowerCase();
};

/**
    Return parser for this file

    @return {Parser}
*/
File.prototype.getParser = function() {
    return parsers.getByExt(this.getExtension());
};

/**
    Create a file from stats informations

    @param {String} filepath
    @param {Object|fs.Stats} stat
    @return {File}
*/
File.createFromStat = function createFromStat(filepath, stat) {
    return new File({
        path: filepath,
        mtime: stat.mtime
    });
};


module.exports = File;
