const Parse = require('../parse');
const Promise = require('../utils/promise');
const parseURIIndexFromPages = require('../parse/parseURIIndexFromPages');

/**
 * List and parse all pages, then create the urls mapping.
 *
 * @param {Output}
 * @return {Promise<Output>}
 */
function preparePages(output) {
    const book = output.getBook();
    const logger = book.getLogger();

    if (book.isMultilingual()) {
        return Promise(output);
    }

    return Parse.parsePagesList(book)
    .then((pages) => {
        logger.info.ln('found', pages.size, 'pages');
        const urls = parseURIIndexFromPages(pages);

        return output.merge({
            pages,
            urls
        });
    });
}

module.exports = preparePages;
