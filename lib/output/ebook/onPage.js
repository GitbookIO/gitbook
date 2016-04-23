var website = require('../website');
var Modifier = require('../modifier');

/**
    Write a page for ebook output

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    var options = output.getOptions();

    // Inline assets
    return Modifier.modifyHTML(page, [
        Modifier.inlineAssets(options.get('root'))
    ])

    // Write page using website generator
    .then(function(resultPage) {
        return website.onPage(output, resultPage);
    });
}

module.exports = onPage;
