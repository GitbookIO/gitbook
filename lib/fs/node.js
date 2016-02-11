var _ = require('lodash');
var util = require('util');
var path = require('path');
var fs = require('graceful-fs');
var mkdirp = require('mkdirp');

var Promise = require('../utils/promise');
var BaseFS = require('./');

function NodeFS() {
    BaseFS.call(this);
}
util.inherits(NodeFS, BaseFS);

// Check if a file exists, run a Promise(true) if that's the case, Promise(false) otherwise
NodeFS.prototype.exists = function(filename) {
    var d = Promise.defer();

    fs.exists(filename, function(exists) {
        d.resolve(exists);
    });

    return d.promise;
};

// Read a file and returns a promise with the content as a buffer
NodeFS.prototype.read = function(filename) {
    return Promise.nfcall(fs.readFile, filename);
};

// Read stat infos about a file
NodeFS.prototype.stat = function(filename) {
    return Promise.nfcall(fs.stat, filename);
};

// Write a file and returns a promise
NodeFS.prototype.write = function(filename, buffer) {
    var folder = path.dirname(filename);
    return Promise()
    .then(function() {
        if (!folder) return;
        return Promise.nfcall(mkdirp, folder);
    })
    .then(function() {
        return Promise.nfcall(fs.writeFile, filename, buffer);
    });
};

// List files in a directory
NodeFS.prototype.readdir = function(folder) {
    return Promise.nfcall(fs.readdir, folder)
    .then(function(files) {
        return _.chain(files)
            .map(function(file) {
                if (file == '.' || file == '..') return;

                var stat = fs.statSync(path.join(folder, file));
                if (stat.isDirectory()) file = file + path.sep;
                return file;
            })
            .compact()
            .value();
    });
};

// Load a JSON/JS file
NodeFS.prototype.loadAsObject = function(filename) {
    return Promise()
    .then(function() {
        var jsFile;

        try {
            jsFile = require.resolve(filename);

            // Invalidate node.js cache for livreloading
            delete require.cache[jsFile];

            return require(jsFile);
        }
        catch(err) {
            return Promise.reject(err);
        }
    });
};

module.exports = NodeFS;
