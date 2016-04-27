var fs = require('../utils/fs');
var Promise = require('../utils/promise');
var PathUtils = require('../utils/path');

var deprecate = require('./deprecate');
var encodeConfig = require('./encodeConfig');

/**
    Encode a global context into a JS object
    It's the context for page's hook, etc

    @param {Output} output
    @return {Object}
*/
function encodeGlobal(output) {
    var book = output.getBook();
    var logger = output.getLogger();
    var outputFolder = output.getRoot();

    var result = {
        log: logger,
        config: encodeConfig(output, book.getConfig())
    };

    result.output = {
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
        toURL: function(s) {
            return s;
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

                return fs.ensure(filePath)
                .then(function() {
                    return fs.writeFile(filePath, content);
                });
            });
        }
    };

    result.isMultilingual = function() {
        return book.isMultilingual();
    };

    result.isLanguageBook = function() {
        return false;
    };

    deprecate.field(output, 'this.book', result, 'book',
        result, '"book" property is deprecated, use "this" directly instead');

    deprecate.field(output, 'this.options', result, 'options',
        result.config.values, '"options" property is deprecated, use config.get(key) instead');

    return result;
}

module.exports = encodeGlobal;
