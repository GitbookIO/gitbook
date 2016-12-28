const path = require('path');
const Promise = require('../utils/promise');
const PathUtils = require('../utils/path');
const fs = require('../utils/fs');

const Plugins = require('../plugins');
const deprecate = require('./deprecate');
const defaultBlocks = require('../constants/defaultBlocks');
const gitbook = require('../gitbook');
const parsers = require('../parsers');

const encodeConfig = require('./encodeConfig');
const encodeSummary = require('./encodeSummary');
const encodeNavigation = require('./encodeNavigation');
const encodePage = require('./encodePage');

/**
 * Encode a global context into a JS object
 * It's the context for page's hook, etc
 *
 * @param {Output} output
 * @return {Object}
 */
function encodeGlobal(output) {
    const book = output.getBook();
    const bookFS = book.getContentFS();
    const logger = output.getLogger();
    const outputFolder = output.getRoot();
    const plugins = output.getPlugins();
    const blocks = Plugins.listBlocks(plugins);
    const urls = output.getURLIndex();

    const result = {
        log: logger,
        config: encodeConfig(output, book.getConfig()),
        summary: encodeSummary(output, book.getSummary()),

        /**
         * Return absolute path to the root folder of the book
         * @return {String}
         */
        root() {
            return book.getRoot();
        },

        /**
         * Return absolute path to the root folder of the book (for content)
         * @return {String}
         */
        contentRoot() {
            return book.getContentRoot();
        },

        /**
         * Check if the book is a multilingual book.
         * @return {Boolean}
         */
        isMultilingual() {
            return book.isMultilingual();
        },

        /**
         * Check if the book is a language book for a multilingual book.
         * @return {Boolean}
         */
        isLanguageBook() {
            return book.isLanguageBook();
        },

        /**
         * Read a file from the book.
         * @param {String} fileName
         * @return {Promise<Buffer>}
         */
        readFile(fileName) {
            return bookFS.read(fileName);
        },

        /**
         * Read a file from the book as a string.
         * @param {String} fileName
         * @return {Promise<String>}
         */
        readFileAsString(fileName) {
            return bookFS.readAsString(fileName);
        },

        /**
         * Resolve a file from the book root.
         * @param {String} fileName
         * @return {String}
        */
        resolve(fileName) {
            return path.resolve(book.getContentRoot(), fileName);
        },

        /**
         * Resolve a page by it path.
         * @param {String} filePath
         * @return {String}
         */
        getPageByPath(filePath) {
            const page = output.getPage(filePath);
            if (!page) return undefined;

            return encodePage(output, page);
        },

        /**
         * Render a block of text (markdown/asciidoc).
         * @param {String} type
         * @param {String} text
         * @return {Promise<String>}
         */
        renderBlock(type, text) {
            const parser = parsers.get(type);

            return parser.parsePage(text)
                .get('content');
        },

        /**
         * Render an inline text (markdown/asciidoc).
         * @param {String} type
         * @param {String} text
         * @return {Promise<String>}
         */
        renderInline(type, text) {
            const parser = parsers.get(type);

            return parser.parseInline(text)
                .get('content');
        },

        template: {

            /**
             * Apply a templating block and returns its result.
             * @param {String} name
             * @param {Object} blockData
             * @return {Promise|Object}
             */
            applyBlock(name, blockData) {
                const block = blocks.get(name) || defaultBlocks.get(name);
                return Promise(block.applyBlock(blockData, result));
            }
        },

        output: {

            /**
             * Name of the generator being used
             * {String}
             */
            name: output.getGenerator(),

            /**
             * Return absolute path to the root folder of output
             * @return {String}
             */
            root() {
                return outputFolder;
            },

            /**
             * Resolve a file from the output root.
             * @param {String} fileName
             * @return {String}
             */
            resolve(fileName) {
                return path.resolve(outputFolder, fileName);
            },

            /**
             * Convert a filepath into an url
             * @return {String}
             */
            toURL(filePath) {
                return urls.resolveToURL(filePath);
            },

            /**
             * Check that a file exists.
             * @param {String} fileName
             * @return {Promise}
             */
            hasFile(fileName, content) {
                return Promise()
                .then(() => {
                    const filePath = PathUtils.resolveInRoot(outputFolder, fileName);

                    return fs.exists(filePath);
                });
            },

            /**
             * Write a file to the output folder,
             * It creates the required folder
             *
             * @param {String} fileName
             * @param {Buffer} content
             * @return {Promise}
             */
            writeFile(fileName, content) {
                return Promise()
                .then(() => {
                    const filePath = PathUtils.resolveInRoot(outputFolder, fileName);

                    return fs.ensureFile(filePath)
                    .then(() => {
                        return fs.writeFile(filePath, content);
                    });
                });
            },

            /**
             * Copy a file to the output folder
             * It creates the required folder.
             *
             * @param {String} inputFile
             * @param {String} outputFile
             * @param {Buffer} content
             * @return {Promise}
             */
            copyFile(inputFile, outputFile, content) {
                return Promise()
                .then(() => {
                    const outputFilePath = PathUtils.resolveInRoot(outputFolder, outputFile);

                    return fs.ensureFile(outputFilePath)
                    .then(() => {
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

    deprecate.field(output, 'this.navigation', result, 'navigation', () => {
        return encodeNavigation(output);
    }, '"navigation" property is deprecated');

    deprecate.field(output, 'this.book', result, 'book',
        result, '"book" property is deprecated, use "this" directly instead');

    deprecate.field(output, 'this.options', result, 'options',
        result.config.values, '"options" property is deprecated, use config.get(key) instead');

    return result;
}

module.exports = encodeGlobal;
