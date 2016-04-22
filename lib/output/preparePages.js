var Parse = require('../parse');

/**
    List and prepare all pages

    @param {Output}
    @return {Promise<Output>}
*/
function preparePages(output) {
    var book = output.getBook();

    return Parse.parsePagesList(book)
    .then(function(pages) {
        return output.set('pages', pages);
    });
}

module.exports = preparePages;
