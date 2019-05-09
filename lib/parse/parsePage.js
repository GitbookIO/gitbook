var parsePageFromString = require('./parsePageFromString');

/**
 * Parse a page, read its content and parse the YAMl header
 *
 * @param {Book} book
 * @param {Page} page
 * @return {Promise<Page>}
 */
function parsePage(book, page) {
    var fs = book.getContentFS();
    var file = page.getFile();

    return fs.readAsString(file.getPath())
    .then(function(content) {
        return parsePageFromString(page, content);
    });
}


module.exports = parsePage;
