const parseStructureFile = require('./parseStructureFile');
const Glossary = require('../models/glossary');

/**
    Parse glossary

    @param {Book} book
    @return {Promise<Book>}
*/
function parseGlossary(book) {
    const logger = book.getLogger();

    return parseStructureFile(book, 'glossary')
    .spread(function(file, entries) {
        if (!file) {
            return book;
        }

        logger.debug.ln('glossary index file found at', file.getPath());

        const glossary = Glossary.createFromEntries(file, entries);
        return book.set('glossary', glossary);
    });
}

module.exports = parseGlossary;
