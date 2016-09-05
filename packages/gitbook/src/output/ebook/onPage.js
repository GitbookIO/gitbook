const WebsiteGenerator = require('../website');
const Modifiers = require('../modifiers');

/**
    Write a page for ebook output

    @param {Output} output
    @param {Output}
*/
function onPage(output, page) {
    const options = output.getOptions();

    // Inline assets
    return Modifiers.modifyHTML(page, [
        Modifiers.inlineAssets(options.get('root'), page.getFile().getPath())
    ])

    // Write page using website generator
    .then(function(resultPage) {
        return WebsiteGenerator.onPage(output, resultPage);
    });
}

module.exports = onPage;
