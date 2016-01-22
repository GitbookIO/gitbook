var Q = require('q');
var _ = require('lodash');
var util = require('util');
var path = require('path');
var fs = require('fs');

var BaseFS = require('./');

function NodeFS() {
    BaseFS.call(this);
}
util.inherits(NodeFS, BaseFS);

// Check if a file exists, run a Promise(true) if that's the case, Promise(false) otherwise
NodeFS.prototype.exists = function(filename) {
    var d = Q.defer();

    fs.exists(filename, function(exists) {
        d.resolve(exists);
    });

    return d.promise;
};

// Read a file and returns a promise with the content as a buffer
NodeFS.prototype.read = function(filename) {
    return Q.nfcall(fs.readFile, filename);
};

// Write a file and returns a promise
NodeFS.prototype.write = function(filename, buffer) {
    return Q.nfcall(fs.writeFile, filename, buffer);
};

// List files in a directory
NodeFS.prototype.readdir = function(folder) {
    return Q.nfcall(fs.readdir, folder)
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
    return Q()
    .then(function() {
        var jsFile;

        try {
            jsFile = require.resolve(filename);

            // Invalidate node.js cache for livreloading
            delete require.cache[jsFile];

            return require(jsFile);
        }
        catch(err) {
            return Q.reject(err);
        }
    });
};

module.exports = NodeFS;
