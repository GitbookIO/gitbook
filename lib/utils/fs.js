var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var destroy = require('destroy');
var tmp = require('tmp');

var Promise = require('./promise');

// Write a stream to a file
function writeStream(filename, st) {
    var d = Promise.defer();

    var wstream = fs.createWriteStream(filename);
    var cleanup = function() {
        destroy(wstream);
        wstream.removeAllListeners();
    };

    wstream.on('finish', function () {
        cleanup();
        d.resolve();
    });
    wstream.on('error', function (err) {
        cleanup();
        d.reject(err);
    });

    st.on('error', function(err) {
        cleanup();
        d.reject(err);
    });

    st.pipe(wstream);

    return d.promise;
}

// Copy a file using stream
function copyFile(from, to) {
    return Promise()
    .then(function() {
        return writeStream(to, fs.createReadStream(from));
    });
}

// Return a promise resolved with a boolean
function fileExists(filename) {
    var d = Promise.defer();

    fs.exists(filename, function(exists) {
        d.resolve(exists);
    });

    return d.promise;
}

// Generate temporary file
function genTmpFile(opts) {
    return Promise.nfcall(tmp.file, opts)
        .get(0);
}

module.exports = {
    exists: fileExists,
    mkdirp: Promise.nfbind(mkdirp),
    readFile: Promise.nfbind(fs.readFile),
    writeFile: Promise.nfbind(fs.writeFile),
    stat: Promise.nfbind(fs.stat),
    statSync: fs.statSync,
    readdir: Promise.nfbind(fs.readdir),
    writeStream: writeStream,
    copy: copyFile,
    tmpFile: genTmpFile
};
