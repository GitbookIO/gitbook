var JSONUtils = require('../json');
var deprecate = require('./deprecate');
var encodeNavigation = require('./encodeNavigation');

/**
    Encode a page in a context to a JS API

    @param {Output} output
    @param {Page} page
    @return {Object}
*/
function encodePage(output, page) {
    var book = output.getBook();
    var summary = book.getSummary();
    var fs = book.getContentFS();
    var file = page.getFile();

    // JS Page is based on the JSON output
    var result = JSONUtils.encodePage(page, summary);

    result.type = file.getType();
    result.path = file.getPath();
    result.rawPath = fs.resolve(result.path);

    // todo: (as deprecated)
    // page.progress
    // page.navigation

    // Deprecated properties
    deprecate.field(output, 'page.navigation', result, 'sections', encodeNavigation(output),
        '"navigation" property is deprecated');

    deprecate.field(output, 'page.sections', result, 'sections', [
        {
            content: result.content,
            type: 'normal'
        }
    ], '"sections" property is deprecated, use page.content instead');

    return result;
}

module.exports = encodePage;
