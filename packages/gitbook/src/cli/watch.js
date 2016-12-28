const path = require('path');
const chokidar = require('chokidar');

const Promise = require('../utils/promise');
const parsers = require('../parsers');

/**
    Watch a folder and resolve promise once a file is modified

    @param {String} dir
    @return {Promise}
*/
function watch(dir) {
    const d = Promise.defer();
    dir = path.resolve(dir);

    const toWatch = [
        'book.json', 'book.js', '_layouts/**'
    ];

    // Watch all parsable files
    parsers.extensions.forEach((ext) => {
        toWatch.push('**/*' + ext);
    });

    const watcher = chokidar.watch(toWatch, {
        cwd: dir,
        ignored: '_book/**',
        ignoreInitial: true
    });

    watcher.once('all', (e, filepath) => {
        watcher.close();

        d.resolve(filepath);
    });
    watcher.once('error', (err) => {
        watcher.close();

        d.reject(err);
    });

    return d.promise;
}

module.exports = watch;
