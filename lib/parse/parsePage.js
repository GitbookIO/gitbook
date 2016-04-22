var fm = require('front-matter');

/**
    Parse a page, read its content and parse the YAMl header

    @param {Book} book
    @param {Page} page
    @return {Promise<Page>}
*/
function parsePage(book, page) {
    var fs = book.getContentFS();
    var file = page.getFile();

    return fs.readAsString(file.getPath())
    .then(function(content) {
        var parsed = fm(content);

        page = page.set('content', parsed.body);
        page = page.set('attributes', parsed.attributes);

        return page;
    });
}


module.exports = parsePage;
