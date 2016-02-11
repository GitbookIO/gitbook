var _ = require('lodash');
var path = require('path');
var Buffer = require('buffer').Buffer;
var destroy = require('destroy');

var Promise = require('../utils/promise');

/*
A filesystem is an interface to read/write files
GitBook can works with a virtual filesystem, for example in the browser.
*/

// .readdir return files/folder as a list of string, folder ending with '/'
function pathIsFolder(filename) {
    return _.last(filename) == '/' || _.last(filename) == '\\';
}


function FS() {

}

// Check if a file exists, run a Promise(true) if that's the case, Promise(false) otherwise
FS.prototype.exists = function(filename) {
    // To implement for each fs
};

// Read a file and returns a promise with the content as a buffer
FS.prototype.read = function(filename) {
    // To implement for each fs
};

// Read stat infos about a file
FS.prototype.stat = function(filename) {
    // To implement for each fs
};

// Write a file and returns a promise
FS.prototype.write = function(filename, buffer) {
    // To implement for each fs
};

// List files/directories in a directory
FS.prototype.readdir = function(folder) {
    // To implement for each fs
};


// These methods don't require to be redefined, by default it uses .exists, .read, .write, .list
// For optmization, it can be redefined:

// List files in a directory
FS.prototype.listFiles = function(folder) {
    return this.readdir(folder)
    .then(function(files) {
        return _.reject(files, pathIsFolder);
    });
};

// List all files in the fs
FS.prototype.listAllFiles = function(folder) {
    var that = this;

    return this.readdir(folder)
    .then(function(files) {
        return _.reduce(files, function(prev, file) {
            return prev.then(function(output) {
                var isDirectory = pathIsFolder(file);

                if (!isDirectory) {
                    output.push(file);
                    return output;
                } else {
                    return that.listAllFiles(path.join(folder, file))
                    .then(function(files) {
                        return output.concat(_.map(files, function(_file) {
                            return path.join(file, _file);
                        }));
                    });
                }
            });
        }, Promise([]));
    });
};

// Read a file as a string (utf-8)
FS.prototype.readAsString = function(filename) {
    return this.read(filename)
    .then(function(buf) {
        return buf.toString('utf-8');
    });
};

// Write a stream to a file and returns a promise
FS.prototype.writeStream = function(filename, stream) {
    var bufs = [];
    var d = Promise.defer();

    var cleanup = function() {
        destroy(stream);
        stream.removeAllListeners();
    };

    stream.on('data', function(d) {
        bufs.push(d);
    });

    stream.on('error', function(err) {
        cleanup();

        d.reject(err);
    });

    stream.on('end', function(){
        cleanup();

        var buf = Buffer.concat(bufs);
        d.resolve(buf);
    });

    return d.promise;
};

// Copy a file
FS.prototype.copy = function(from, to) {
    var that = this;

    return this.read(from)
    .then(function(buf) {
        return that.write(to, buf);
    });
};

// Find a file in a folder (case incensitive)
// Return the real filename
FS.prototype.findFile = function findFile(root, filename) {
    return this.listFiles(root)
    .then(function(files) {
        return _.find(files, function(file) {
            return (file.toLowerCase() == filename.toLowerCase());
        });
    });
};

// Load a JSON file
// By default, fs only supports JSON
FS.prototype.loadAsObject = function(filename) {
    return this.readAsString(filename)
    .then(function(str) {
        return JSON.parse(str);
    });
};

module.exports = FS;
