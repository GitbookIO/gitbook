var Parse = require('../parse');
var Promise = require('../utils/promise');

/**
    List and prepare all pages

    @param {Output}
    @return {Promise<Output>}
*/
function preparePages(output) {
    var book = output.getBook();
    var logger = book.getLogger();

    if (book.isMultilingual()) {
        return Promise(output);
    }

    return Parse.parsePagesList(book)
    .then(function(result) {
        logger.info.ln('found', result.pages.size, 'pages');

        output = output.set('book', result.book);
        return output.set('pages', result.pages);
    });
}

module.exports = preparePages;
