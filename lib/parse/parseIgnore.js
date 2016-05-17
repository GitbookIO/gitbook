var Promise = require('../utils/promise');
var IGNORE_FILES = require('../constants/ignoreFiles');

var DEFAULT_IGNORES = [
    // Skip Git stuff
    '.git/',

    // Skip OS X meta data
    '.DS_Store',

    // Skip stuff installed by plugins
    'node_modules',

    // Skip book outputs
    '_book',

    // Ignore files in the templates folder
    '_layouts'
];

/**
    Parse ignore files

    @param {Book}
    @return {Book}
*/
function parseIgnore(book) {
    if (book.isLanguageBook()) {
        return Promise.reject(new Error('Ignore files could be parsed for language books'));
    }

    var fs = book.getFS();
    var ignore = book.getIgnore();

    ignore = ignore.add(DEFAULT_IGNORES);

    return Promise.serie(IGNORE_FILES, function(filename) {
        return fs.readAsString(filename)
        .then(function(content) {
            ignore = ignore.add(content.toString().split(/\r?\n/));
        }, function(err) {
            return Promise();
        });
    })

    .then(function() {
        return book.setIgnore(ignore);
    });
}

module.exports = parseIgnore;
