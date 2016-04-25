var Promise = require('../utils/promise');
var error = require('../utils/error');

var Parse = require('../parse');

/**
    Prepare and generate HTML for a page

    @param {Output} output
    @param {Page} page
    @return {Promise<Page>}
*/
function generatePage(output, page) {
    var book = output.getBook();

    return Parse.parsePage(book, page)
    .then(function(resultPage) {
        var file = resultPage.getFile();
        var filePath = file.getPath();
        var parser = file.getParser();

        if (!parser) {
            return Promise.reject(error.FileNotParsableError({
                filename: filePath
            }));
        }

        return Promise(resultPage.getContent())
        .then(parser.page.prepare)
        .then(parser.page)
        .get('content')
        .then(function(content) {
            return resultPage.set('content', content);
        });
    });
}

module.exports = generatePage;
