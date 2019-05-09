var path = require('path');
var Promise = require('../utils/promise');
var PathUtils = require('../utils/path');
var fs = require('../utils/fs');

var Plugins = require('../plugins');
var deprecate = require('./deprecate');
var fileToURL = require('../output/helper/fileToURL');
var defaultBlocks = require('../constants/defaultBlocks');
var gitbook = require('../gitbook');
var parsers = require('../parsers');

var encodeConfig = require('./encodeConfig');
var encodeSummary = require('./encodeSummary');
var encodeNavigation = require('./encodeNavigation');
var encodePage = require('./encodePage');

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
    var plugins = output.getPlugins();
    var blocks = Plugins.listBlocks(plugins);

    var result = {
        log: logger,
        config: encodeConfig(output, book.getConfig()),
        summary: encodeSummary(output, book.getSummary()),

        /**
            Check if the book is a multilingual book

            @return {Boolean}
        */
        isMultilingual: function() {
            return book.isMultilingual();
        },

        /**
            Check if the book is a language book for a multilingual book

            @return {Boolean}
        */
        isLanguageBook: function() {
            return book.isLanguageBook();
        },

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

        /**
            Resolve a file from the book root

            @param {String} fileName
            @return {String}
        */
        resolve: function(fileName) {
            return path.resolve(book.getContentRoot(), fileName);
        },

        /**
            Resolve a page by it path

            @param {String} filePath
            @return {String}
        */
        getPageByPath: function(filePath) {
            var page = output.getPage(filePath);
            if (!page) return undefined;

            return encodePage(output, page);
        },

        /**
            Render a block of text (markdown/asciidoc)

            @param {String} type
            @param {String} text
            @return {Promise<String>}
        */
        renderBlock: function(type, text) {
            var parser = parsers.get(type);

            return parser.parsePage(text)
                .get('content');
        },

        /**
            Render an inline text (markdown/asciidoc)

            @param {String} type
            @param {String} text
            @return {Promise<String>}
        */
        renderInline: function(type, text) {
            var parser = parsers.get(type);

            return parser.parseInline(text)
                .get('content');
        },

        template: {
            /**
                Apply a templating block and returns its result

                @param {String} name
                @param {Object} blockData
                @return {Promise|Object}
            */
            applyBlock: function(name, blockData) {
                var block = blocks.get(name) || defaultBlocks.get(name);
                return Promise(block.applyBlock(blockData, result));
            }
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
                Resolve a file from the output root

                @param {String} fileName
                @return {String}
            */
            resolve: function(fileName) {
                return path.resolve(outputFolder, fileName);
            },

            /**
                Convert a filepath into an url
                @return {String}
            */
            toURL: function(filePath) {
                return fileToURL(output, filePath);
            },

            /**
                Check that a file exists.

                @param {String} fileName
                @return {Promise}
            */
            hasFile: function(fileName, content) {
                return Promise()
                .then(function() {
                    var filePath = PathUtils.resolveInRoot(outputFolder, fileName);

                    return fs.exists(filePath);
                });
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
            },

            /**
                Copy a file to the output folder
                It creates the required folder.

                @param {String} inputFile
                @param {String} outputFile
                @param {Buffer} content
                @return {Promise}
            */
            copyFile: function(inputFile, outputFile, content) {
                return Promise()
                .then(function() {
                    var outputFilePath = PathUtils.resolveInRoot(outputFolder, outputFile);

                    return fs.ensureFile(outputFilePath)
                    .then(function() {
                        return fs.copy(inputFile, outputFilePath);
                    });
                });
            }
        },

        gitbook: {
            version: gitbook.version
        }
    };

    // Deprecated properties

    deprecate.renamedMethod(output, 'this.isSubBook', result, 'isSubBook', 'isLanguageBook');
    deprecate.renamedMethod(output, 'this.contentLink', result, 'contentLink', 'output.toURL');

    deprecate.field(output, 'this.generator', result, 'generator',
        output.getGenerator(), '"this.generator" property is deprecated, use "this.output.name" instead');

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
