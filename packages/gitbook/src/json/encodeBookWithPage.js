const encodeBook = require('./encodeBook');
const encodePage = require('./encodePage');
const encodeFile = require('./encodeFile');

/**
 * Return a JSON representation of a book with a specific file
 *
 * @param {Book} output
 * @param {Page} page
 * @return {Object}
 */
function encodeBookWithPage(book, page) {
    const file = page.getFile();

    const result = encodeBook(book);
    result.page = encodePage(page, book.getSummary());
    result.file = encodeFile(file);

    return result;
}

module.exports = encodeBookWithPage;
