const Immutable = require('immutable');

/**
 * Decode changes from a JS API to a page object.
 * Only the content can be edited by plugin's hooks.
 *
 * @param {Output} output
 * @param {Page} page: page instance to edit
 * @param {Object} result: result from API
 * @return {Page}
 */
function decodePage(output, page, result) {
    const originalContent = page.getContent();

    // No returned value
    // Existing content will be used
    if (!result) {
        return page;
    }

    // Update page attributes
    const newAttributes = Immutable.fromJS(result.attributes);
    page = page.set('attributes', newAttributes);

    // GitBook 3
    // Use returned page.content if different from original content
    if (result.content != originalContent) {
        page = page.set('content', result.content);
    }

    return page;
}

module.exports = decodePage;
