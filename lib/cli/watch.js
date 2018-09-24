var path = require('path');
var chokidar = require('chokidar');

var Promise = require('../utils/promise');
var parsers = require('../parsers');

/**
    Watch a folder and resolve promise once a file is modified

    @param {String} dir
    @return {Promise}
*/
function watch(dir, callback) {
    dir = path.resolve(dir);

    var toWatch = [
        'book.json', 'book.js', '_layouts/**'
    ];

    // Watch all parsable files
    parsers.extensions.forEach(function(ext) {
        toWatch.push('**/*' + ext);
    });

    var watcher = chokidar.watch(toWatch, {
        cwd: dir,
        ignored: '_book/**',
        ignoreInitial: true
    });

    watcher.on('all', function(e, filepath) {
        callback(null, filepath);
    });
    watcher.on('error', function(err) {
        callback(err);
    });
}

module.exports = watch;
