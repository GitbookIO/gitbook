const Promise = require('../utils/promise');
const timing = require('../utils/timing');
const Book = require('../models/book');

const parseIgnore = require('./parseIgnore');
const parseConfig = require('./parseConfig');
const parseGlossary = require('./parseGlossary');
const parseSummary = require('./parseSummary');
const parseReadme = require('./parseReadme');
const parseLanguages = require('./parseLanguages');

/**
    Parse content of a book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseBookContent(book) {
    return Promise(book)
        .then(parseReadme)
        .then(parseSummary)
        .then(parseGlossary);
}

/**
    Parse a multilingual book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseMultilingualBook(book) {
    const languages = book.getLanguages();
    const langList = languages.getList();

    return Promise.reduce(langList, function(currentBook, lang) {
        const langID = lang.getID();
        const child = Book.createFromParent(currentBook, langID);
        let ignore = currentBook.getIgnore();

        return Promise(child)
        .then(parseConfig)
        .then(parseBookContent)
        .then(function(result) {
            // Ignore content of this book when generating parent book
            ignore = ignore.add(langID + '/**');
            currentBook = currentBook.set('ignore', ignore);

            return currentBook.addLanguageBook(langID, result);
        });
    }, book);
}


/**
    Parse a whole book from a filesystem

    @param {Book} book
    @return {Promise<Book>}
*/
function parseBook(book) {
    return timing.measure(
        'parse.book',
        Promise(book)
        .then(parseIgnore)
        .then(parseConfig)
        .then(parseLanguages)
        .then(function(resultBook) {
            if (resultBook.isMultilingual()) {
                return parseMultilingualBook(resultBook);
            } else {
                return parseBookContent(resultBook);
            }
        })
    );
}

module.exports = parseBook;
