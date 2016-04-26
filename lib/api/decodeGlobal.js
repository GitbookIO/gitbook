var decodeConfig = require('./decodeConfig');

/**
    Decode changes from a JS API to a output object

    @param {Output} output
    @param {Object} result: result from API
    @return {Output}
*/
function decodeGlobal(output, result) {
    var book = output.getBook();
    var config = book.getConfig();

    // Update config
    config = decodeConfig(config, result.config);
    book = book.set('config', config);

    return output.set('book', book);
}

module.exports = decodeGlobal;
