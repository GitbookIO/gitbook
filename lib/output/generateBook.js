var Output = require('../models/output');
var Promise = require('../utils/promise');

var callHook = require('./callHook');
var preparePlugins = require('./preparePlugins');
var preparePages = require('./preparePages');
var prepareAssets = require('./prepareAssets');
var generateAssets = require('./generateAssets');
var generatePages = require('./generatePages');

/**
    Generate a book using a generator.

    The overall process is:
        1. List and load plugins for this book
        2. Call hook "config"
        3. Call hook "init"
        4. Initialize generator
        5. List all assets and pages
        6. Copy all assets to output
        7. Generate all pages
        8. Call hook "finish:before"
        9. Finish generation
        10. Call hook "finish"


    @param {Generator} generator
    @param {Book} book
    @param {Object} options

    @return {Promise}
*/
function generateBook(generator, book, options) {
    options = generator.Options(options);

    return Promise(
        Output.createForBook(book, options)
    )
    .then(preparePlugins)
    .then(preparePages)
    .then(prepareAssets)
    .then(generateAssets.bind(null, generator))
    .then(generatePages.bind(null, generator));
}

module.exports = generateBook;
