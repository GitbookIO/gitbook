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

    var config = book.getConfig();
    var configFile = config.getFile().getPath();

    function filterFile(file) {
        return !(
            file === summaryFile ||
            file === glossaryFile ||
            file === langsFile ||
            file === configFile ||
            book.isContentFileIgnored(file) ||
            pages.has(file)
        );
    }

    return timing.measure(
        'parse.listAssets',
        fs.listAllFiles('.', filterFile)
    );
}

module.exports = listAssets;
