var Immutable = require('immutable');
var fm = require('front-matter');
var direction = require('direction');

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

        return page.merge({
            content: parsed.body,
            attributes: Immutable.fromJS(parsed.attributes),
            dir: direction(parsed.body)
        });
    });
}


module.exports = parsePage;
