var path = require('path');
var chokidar = require('chokidar');

var Promise = require('../utils/promise');
var parsers = require('../parsers');

/**
    Watch a book and resolve promise once a file is modified

    @param {Book} book
    @param {String} outputDir
    @return {Promise}
*/
function watch(book, outputDir) {
    var d = Promise.defer();
    var dir = path.resolve(book.getRoot());
    var contentDir = path.resolve(book.getContentRoot());

    var toWatch = [
        'book.json', 'book.js', contentDir+'/_layouts/**'
    ];

    // Watch all parsable files
    parsers.extensions.forEach(function(ext) {
        toWatch.push(contentDir+'/**/*'+ext);
    });

    var watcher = chokidar.watch(toWatch, {
        cwd: dir,
        ignored: outputDir+'/**',
        ignoreInitial: true
    });

    watcher.once('all', function(e, filepath) {
        watcher.close();

        d.resolve(filepath);
    });
    watcher.once('error', function(err) {
        watcher.close();

        d.reject(err);
    });

    return d.promise;
}

module.exports = watch;
