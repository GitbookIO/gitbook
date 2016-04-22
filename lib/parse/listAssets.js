
/**
    List all assets in a book
    Assets are file not ignored and not a page

    @param {Book} book
    @param {List<String>} pages
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

module.exports = listAssets;
