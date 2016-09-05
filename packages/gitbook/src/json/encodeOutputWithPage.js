const encodeOutput = require('./encodeOutput');
const encodePage = require('./encodePage');
const encodeFile = require('./encodeFile');

/**
 * Return a JSON representation of a book with a specific file
 *
 * @param {Book} output
 * @param {Page} page
 * @return {Object}
 */
function encodeOutputWithPage(output, page) {
    const file = page.getFile();
    const book = output.getBook();

    const result = encodeOutput(output);
    result.page = encodePage(page, book.getSummary());
    result.file = encodeFile(file);

    return result;
}

module.exports = encodeOutputWithPage;
