var findParsableFile = require('./findParsableFile');

/**
    Lookup a structure file (ex: SUMMARY.md, GLOSSARY.md) in a book. Uses
    book's config to find it.

    @param {Book} book
    @param {String} type: one of ["glossary", "readme", "summary", "langs"]
    @return {Promise<File | Undefined>} The path of the file found, relative
    to the book content root.
*/
function lookupStructureFile(book, type) {
    var config = book.getConfig();

    var fileToSearch = config.getValue(['structure', type]);

    return findParsableFile(book, fileToSearch);
}

module.exports = lookupStructureFile;
