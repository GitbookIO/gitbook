var encodeBook = require('./encodeBook');
var encodePage = require('./encodePage');
var encodeFile = require('./encodeFile');

/**
 * Return a JSON representation of a book with a specific file
 *
 * @param {Book} output
 * @param {Page} page
 * @return {Object}
 */
function encodeBookWithPage(book, page) {
    var file = page.getFile();

    var result = encodeBook(book);
    result.page = encodePage(page, book.getSummary());
    result.file = encodeFile(file);

    return result;
}

module.exports = encodeBookWithPage;
