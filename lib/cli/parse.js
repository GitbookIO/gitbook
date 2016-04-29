var options = require('./options');
var getBook = require('./getBook');

var Parse = require('../parse');

function printBook(book) {
    var logger = book.getLogger();

    var config = book.getConfig();
    var configFile = config.getFile();

    var summary = book.getSummary();
    var summaryFile = summary.getFile();

    var readme = book.getReadme();
    var readmeFile = readme.getFile();

    var glossary = book.getGlossary();
    var glossaryFile = glossary.getFile();

    if (configFile.exists()) {
        logger.info.ln('Configuration file is', configFile.getPath());
    }

    if (readmeFile.exists()) {
        logger.info.ln('Introduction file is', readmeFile.getPath());
    }

    if (glossaryFile.exists()) {
        logger.info.ln('Glossary file is', glossaryFile.getPath());
    }

    if (summaryFile.exists()) {
        logger.info.ln('Table of Contents file is', summaryFile.getPath());
    }
}

function printMultingualBook(book) {
    var logger = book.getLogger();
    var languages = book.getLanguages();
    var books = book.getBooks();

    logger.info.ln(languages.size + ' languages');

    languages.forEach(function(lang) {
        logger.info.ln('Language:', lang.getTitle());
        printBook(books.get(lang.getID()));
        logger.info.ln('');
    });
}

module.exports = {
    name: 'parse [book]',
    description: 'parse and print debug information about a book',
    options: [
        options.log
    ],
    exec: function(args, kwargs) {
        var book = getBook(args, kwargs);
        var logger = book.getLogger();

        return Parse.parseBook(book)
        .then(function(resultBook) {
            var rootFolder = book.getRoot();
            var contentFolder = book.getContentRoot();

            logger.info.ln('Book located in:', rootFolder);
            if (contentFolder != rootFolder) {
                logger.info.ln('Content located in:', contentFolder);
            }

            if (resultBook.isMultilingual()) {
                printMultingualBook(resultBook);
            } else {
                printBook(resultBook);
            }
        });
    }
};
