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
    const readme = book.getReadme();

    if (book.isMultilingual()) {
        return Promise(output);
    }

    return Parse.parsePagesList(book)
    .then((pages) => {
        logger.info.ln('found', pages.size, 'pages');
        let urls = parseURIIndexFromPages(pages);

        // Readme should always generate an index.html
        urls = urls.append(readme.getFile().getPath(), 'index.html');

        return output.merge({
            pages,
            urls
        });
    });
}

module.exports = preparePages;
