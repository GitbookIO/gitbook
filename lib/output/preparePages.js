var Parse = require('../parse');

/**
    List and prepare all pages

    @param {Output}
    @return {Promise<Output>}
*/
function preparePages(output) {
    var book = output.getBook();
    var logger = book.getLogger();

    return Parse.parsePagesList(book)
    .then(function(pages) {
        logger.info.ln('found', pages.size, 'pages');

        return output.set('pages', pages);
    });
}

module.exports = preparePages;
