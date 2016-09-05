const Parse = require('../parse');
const Promise = require('../utils/promise');

/**
    List and prepare all pages

    @param {Output}
    @return {Promise<Output>}
*/
function preparePages(output) {
    const book = output.getBook();
    const logger = book.getLogger();

    if (book.isMultilingual()) {
        return Promise(output);
    }

    return Parse.parsePagesList(book)
    .then(function(pages) {
        logger.info.ln('found', pages.size, 'pages');

        return output.set('pages', pages);
    });
}

module.exports = preparePages;
