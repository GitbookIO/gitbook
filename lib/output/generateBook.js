var Parse = require('../parse');

/**
    List all assets for a book

    @param {Book} book
    @param {Map<String:Page>} pages
    @param
*/
function listAssets(book, pages) {
    var fs = book.getContentFS();

    return fs.listAllFiles()
    .then(function(files) {
        return files.filterNot(function(file) {
            return (
                book.isContentFileIgnored(file) ||
                pages.has(file)
            );
        });
    });
}


/**
    Generate a book using a generator

    @param {Generator} generator
    @param {Book} book

    @return {Promise}
*/
function generateBook(generator, book) {
    // List all parsable pages
    return Parse.parsePagesList(book)
    .then(function(pages) {
        return listAssets(book, pages);
    });
}


module.exports = generateBook;
