var encodeBook = require('./encodeBook');

/**
 * Encode an output to JSON
 *
 * @param {Output}
 * @return {Object}
 */
function encodeOutputToJson(output) {
    var book = output.getBook();
    var generator = output.getGenerator();
    var options = output.getOptions();

    var result = encodeBook(book);

    result.output = {
        name: generator
    };

    result.options = options.toJS();

    return result;
}

module.exports = encodeOutputToJson;
