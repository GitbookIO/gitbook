var Promise = require('../utils/promise');
var IGNORE_FILES = require('../constants/ignoreFiles');

/**
    Parse ignore files

    @param {Book}
    @return {Book}
*/
function parseIgnore(book) {
    var fs = book.getFS();
    var ignore = book.getIgnore();

    ignore.addPattern([
        // Skip Git stuff
        '.git/',

        // Skip OS X meta data
        '.DS_Store',

        // Skip stuff installed by plugins
        'node_modules',

        // Skip book outputs
        '_book',
        '*.pdf',
        '*.epub',
        '*.mobi',

        // Ignore files in the templates folder
        '_layouts'
    ]);

    return Promise.serie(IGNORE_FILES, function(filename) {
        return fs.readAsString(filename)
        .then(function(content) {
            ignore.addPattern(content.toString().split(/\r?\n/));
        }, function() {
            return Promise();
        });
    })

    .thenResolve(book);
}

module.exports = parseIgnore;
