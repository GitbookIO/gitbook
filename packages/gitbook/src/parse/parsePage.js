const parsePageFromString = require('./parsePageFromString');

/**
 * Parse a page, read its content and parse the YAMl header
 *
 * @param {Book} book
 * @param {Page} page
 * @return {Promise<Page>}
 */
function parsePage(book, page) {
    const fs = book.getContentFS();
    const file = page.getFile();

    return fs.readAsString(file.getPath())
    .then((content) => {
        return parsePageFromString(page, content);
    });
}


module.exports = parsePage;
