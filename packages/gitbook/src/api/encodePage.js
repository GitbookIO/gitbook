const JSONUtils = require('../json');
const deprecate = require('./deprecate');
const encodeProgress = require('./encodeProgress');

/**
    Encode a page in a context to a JS API

    @param {Output} output
    @param {Page} page
    @return {Object}
*/
function encodePage(output, page) {
    const book = output.getBook();
    const summary = book.getSummary();
    const fs = book.getContentFS();
    const file = page.getFile();

    // JS Page is based on the JSON output
    const result = JSONUtils.encodePage(page, summary);

    result.type = file.getType();
    result.path = file.getPath();
    result.rawPath = fs.resolve(result.path);

    deprecate.field(output, 'page.progress', result, 'progress', function() {
        return encodeProgress(output, page);
    }, '"page.progress" property is deprecated');

    deprecate.field(output, 'page.sections', result, 'sections', [
        {
            content: result.content,
            type: 'normal'
        }
    ], '"sections" property is deprecated, use page.content instead');

    return result;
}

module.exports = encodePage;
