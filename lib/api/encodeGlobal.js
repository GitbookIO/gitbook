var path = require('path');

var fs = require('../utils/fs');

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

    var outputFolder = output.getOptions().get('root');

    var result = {
        log: logger,
        config: encodeConfig(output, book.getConfig())
    };

    result.output = {
        name: 'website',

        toURL: function(s) {
            return s;
        },

        writeFile: function(fileName, content) {
            var filePath = path.join(outputFolder, fileName);
            return fs.writeFile(filePath, content);
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
