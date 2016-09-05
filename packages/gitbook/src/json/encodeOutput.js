const encodeBook = require('./encodeBook');

/**
 * Encode an output to JSON
 *
 * @param {Output}
 * @return {Object}
 */
function encodeOutputToJson(output) {
    const book = output.getBook();
    const generator = output.getGenerator();
    const options = output.getOptions();

    const result = encodeBook(book);

    result.output = {
        name: generator
    };

    result.options = options.toJS();

    return result;
}

module.exports = encodeOutputToJson;
