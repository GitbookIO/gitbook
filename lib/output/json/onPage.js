var Modifier = require('../modifier');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    var options = output.

    return Modifier.applyHTMLTransformations(page, [
        Modifier.HTML.resolveLinks()
    ])
    .then(function(newPage) {

    });
}

module.exports = onPage;
