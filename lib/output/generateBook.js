var path = require('path');
var Immutable = require('immutable');

var Output = require('../models/output');
var Promise = require('../utils/promise');
var fs = require('../utils/fs');

var callHook = require('./callHook');
var preparePlugins = require('./preparePlugins');
var preparePages = require('./preparePages');
var prepareAssets = require('./prepareAssets');
var generateAssets = require('./generateAssets');
var generatePages = require('./generatePages');

/**
 * Process an output to generate the book
 *
 * @param {Generator} generator
 * @param {Output} output
 * @return {Promise<Output>}
 */
function processOutput(generator, startOutput) {
    return Promise(startOutput)
    .then(preparePlugins)
    .then(preparePages)
    .then(prepareAssets)

    .then(
        callHook.bind(null,
            'config',
            function(output) {
                var book = output.getBook();
                var config = book.getConfig();
                var values = config.getValues();

                return values.toJS();
            },
            function(output, result) {
                var book = output.getBook();
                var config = book.getConfig();

                config = config.updateValues(result);
                book = book.set('config', config);
                return output.set('book', book);
            }
        )
    )

    .then(
        callHook.bind(null,
            'init',
            function(output) {
                return {};
            },
            function(output) {
                return output;
            }
        )
    )

    .then(function(output) {
        if (!generator.onInit) {
            return output;
        }

        return generator.onInit(output);
    })

    .then(generateAssets.bind(null, generator))
    .then(generatePages.bind(null, generator))

    .tap(function(output) {
        var book = output.getBook();

        if (!book.isMultilingual()) {
            return;
        }

        var logger = book.getLogger();
        var books = book.getBooks();
        var outputRoot = output.getRoot();
        var plugins = output.getPlugins();
        var state = output.getState();
        var options = output.getOptions();

        return Promise.forEach(books, function(langBook) {
            // Inherits plugins list, options and state
            var langOptions = options.set('root', path.join(outputRoot, langBook.getLanguage()));
            var langOutput = new Output({
                book:       langBook,
                options:    langOptions,
                state:      state,
                generator:  generator.name,
                plugins:    plugins
            });

            logger.info.ln('');
            logger.info.ln('generating language "' + langBook.getLanguage() + '"');
            return processOutput(generator, langOutput);
        });
    })

    .then(callHook.bind(null,
        'finish:before',
            function(output) {
                return {};
            },
            function(output) {
                return output;
            }
        )
    )

    .then(function(output) {
        if (!generator.onFinish) {
            return output;
        }

        return generator.onFinish(output);
    })

    .then(callHook.bind(null,
        'finish',
            function(output) {
                return {};
            },
            function(output) {
                return output;
            }
        )
    );
}

/**
 * Generate a book using a generator.
 *
 * The overall process is:
 *     1. List and load plugins for this book
 *     2. Call hook "config"
 *     3. Call hook "init"
 *     4. Initialize generator
 *     5. List all assets and pages
 *     6. Copy all assets to output
 *     7. Generate all pages
 *     8. Call hook "finish:before"
 *     9. Finish generation
 *     10. Call hook "finish"
 *
 *
 * @param {Generator} generator
 * @param {Book} book
 * @param {Object} options
 * @return {Promise<Output>}
 */
function generateBook(generator, book, options) {
    options = generator.Options(options);
    var state = generator.State? generator.State({}) : Immutable.Map();
    var start = Date.now();

    return Promise(
        new Output({
            book: book,
            options: options,
            state: state,
            generator: generator.name
        })
    )

    // Cleanup output folder
    .then(function(output) {
        var logger = output.getLogger();
        var rootFolder = output.getRoot();

        logger.debug.ln('cleanup folder "' + rootFolder + '"');
        return fs.ensureFolder(rootFolder)
            .thenResolve(output);
    })

    .then(processOutput.bind(null, generator))

    // Log duration and end message
    .then(function(output) {
        var logger = output.getLogger();
        var end = Date.now();
        var duration = (end - start)/1000;

        logger.info.ok('generation finished with success in ' + duration.toFixed(1) + 's !');

        return output;
    });
}

module.exports = generateBook;
