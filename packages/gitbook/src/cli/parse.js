const options = require('./options');
const getBook = require('./getBook');

const Parse = require('../parse');

function printBook(book) {
    const logger = book.getLogger();

    const config = book.getConfig();
    const configFile = config.getFile();

    const summary = book.getSummary();
    const summaryFile = summary.getFile();

    const readme = book.getReadme();
    const readmeFile = readme.getFile();

    const glossary = book.getGlossary();
    const glossaryFile = glossary.getFile();

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
    const logger = book.getLogger();
    const languages = book.getLanguages();
    const books = book.getBooks();

    logger.info.ln(languages.size + ' languages');

    languages.forEach((lang) => {
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
    exec(args, kwargs) {
        const book = getBook(args, kwargs);
        const logger = book.getLogger();

        return Parse.parseBook(book)
        .then((resultBook) => {
            const rootFolder = book.getRoot();
            const contentFolder = book.getContentRoot();

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
