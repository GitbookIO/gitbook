var deprecate = require('./deprecate');

/**
    Decode changes from a JS API to a page object.
    Only the content can be edited by plugin's hooks.

    @param {Output} output
    @param {Page} page: page instance to edit
    @param {Object} result: result from API
    @return {Page}
*/
function decodePage(output, page, result) {
    var originalContent = page.getContent();

    // No returned value
    // Existing content will be used
    if (!result) {
        return page;
    }

    deprecate.disable('page.sections');

    // GitBook 3
    // Use returned page.content if different from original content
    if (result.content != originalContent) {
        page = page.set('content', result.content);
    }

    // GitBook 2 compatibility
    // Finally, use page.sections
    else if (result.sections) {
        page = page.set('content',
            result.sections.map(function(section) {
                return section.content;
            }).join('\n')
        );
    }

    deprecate.enable('page.sections');

    return page;
}

module.exports = decodePage;
