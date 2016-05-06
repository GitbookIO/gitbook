var timing = require('../utils/timing');

/**
    List all assets in a book
    Assets are file not ignored and not a page

    @param {Book} book
    @param {List<String>} pages
    @param
*/
function listAssets(book, pages) {
    var fs = book.getContentFS();

    var summary = book.getSummary();
    var summaryFile = summary.getFile().getPath();

    var glossary = book.getGlossary();
    var glossaryFile = glossary.getFile().getPath();

    var langs = book.getLanguages();
    var langsFile = langs.getFile().getPath();

    return timing.measure(
        'parse.listAssets',
        fs.listAllFiles()
        .then(function(files) {
            return files.filterNot(function(file) {
                return (
                    book.isContentFileIgnored(file) ||
                    pages.has(file) ||
                    file === summaryFile ||
                    file === glossaryFile ||
                    file === langsFile
                );
            });
        })
    );
}

module.exports = listAssets;
