const timing = require('../utils/timing');

/**
    List all assets in a book
    Assets are file not ignored and not a page

    @param {Book} book
    @param {List<String>} pages
    @param
*/
function listAssets(book, pages) {
    const fs = book.getContentFS();

    const summary = book.getSummary();
    const summaryFile = summary.getFile().getPath();

    const glossary = book.getGlossary();
    const glossaryFile = glossary.getFile().getPath();

    const langs = book.getLanguages();
    const langsFile = langs.getFile().getPath();

    const config = book.getConfig();
    const configFile = config.getFile().getPath();

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
