var Promise = require('../utils/promise');
var PathUtils = require('../utils/path');
var fs = require('../utils/fs');

var deprecate = require('./deprecate');
var encodeConfig = require('./encodeConfig');
var encodeNavigation = require('./encodeNavigation');
var fileToURL = require('../output/helper/fileToURL');

/**
    Encode a global context into a JS object
    It's the context for page's hook, etc

    @param {Output} output
    @return {Object}
*/
function encodeGlobal(output) {
    var book = output.getBook();
    var bookFS = book.getContentFS();
    var logger = output.getLogger();
    var outputFolder = output.getRoot();

    var result = {
        log: logger,
        config: encodeConfig(output, book.getConfig()),

        isMultilingual: function() {
            return book.isMultilingual();
        },

        isLanguageBook: function() {
            return book.isLanguageBook();
        },

        isSubBook: deprecate.method(output, 'this.isSubBook', function() {
            return book.isLanguageBook();
        }, '"isSubBook" is deprecated, use "isLanguageBook()" instead'),

        /**
            Read a file from the book

            @param {String} fileName
            @return {Promise<Buffer>}
        */
        readFile: function(fileName) {
            return bookFS.read(fileName);
        },

        /**
            Read a file from the book as a string

            @param {String} fileName
            @return {Promise<String>}
        */
        readFileAsString: function(fileName) {
            return bookFS.readAsString(fileName);
        },

        output: {
            /**
                Name of the generator being used
                {String}
            */
            name: output.getGenerator(),

            /**
                Return absolute path to the root folder of output
                @return {String}
            */
            root: function() {
                return outputFolder;
            },

            /**
                Convert a filepath into an url
                @return {String}
            */
            toURL: function(filePath) {
                return fileToURL(output, filePath);
            },

            /**
                Write a file to the output folder,
                It creates the required folder

                @param {String} fileName
                @param {Buffer} content
                @return {Promise}
            */
            writeFile: function(fileName, content) {
                return Promise()
                .then(function() {
                    var filePath = PathUtils.resolveInRoot(outputFolder, fileName);

                    return fs.ensureFile(filePath)
                    .then(function() {
                        return fs.writeFile(filePath, content);
                    });
                });
            }
        }
    };

    // Deprecated properties

    deprecate.field(output, 'this.navigation', result, 'navigation', function() {
        return encodeNavigation(output);
    }, '"navigation" property is deprecated');

    deprecate.field(output, 'this.book', result, 'book',
        result, '"book" property is deprecated, use "this" directly instead');

    deprecate.field(output, 'this.options', result, 'options',
        result.config.values, '"options" property is deprecated, use config.get(key) instead');

    return result;
}

module.exports = encodeGlobal;
