const Promise = require('../../utils/promise');

/**
 * Finish the generation, write the languages index
 *
 * @param {Output}
 * @return {Output}
 */
function onFinish(output) {
    const book = output.getBook();

    if (!book.isMultilingual()) {
        return Promise(output);
    }

    // TODO: multilingual index
    return Promise(output);
}

module.exports = onFinish;
