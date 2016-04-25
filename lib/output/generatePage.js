var Promise = require('../utils/promise');
var error = require('../utils/error');

var Parse = require('../parse');
var createTemplateEngine = require('./createTemplateEngine');

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

        // Escape code blocks with raw tags
        .then(parser.page.prepare)

        // Render templating syntax
        .then(function(content) {
            var engine = createTemplateEngine(output);
            return engine.render(filePath, content);
        })

        // Render page using parser (markdown -> HTML)
        .then(parser.page).get('content')

        // Return new page
        .then(function(content) {
            return resultPage.set('content', content);
        });
    });
}

module.exports = generatePage;
