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
    Does the file exists / is set

    @return {Boolean}
*/
File.prototype.exists = function() {
    return Boolean(this.getPath());
};

/**
    Return type of file ('markdown' or 'asciidoc')

    @return {String}
*/
File.prototype.getType = function() {
    var parser = this.getParser();
    if (parser) {
        return parser.getName();
    } else {
        return undefined;
    }
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

/**
    Create a file with only a path

    @param {String} filepath
    @return {File}
*/
File.createWithFilepath = function createWithFilepath(filepath) {
    return new File({
        path: filepath
    });
};

module.exports = File;
