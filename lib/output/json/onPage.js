var JSONUtils = require('../../json');
var Modifier = require('../modifier');
var Writer = require('../writer');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    return Modifier.modifyHTML(page, [
        Modifier.HTML.resolveLinks()
    ])
    .then(function(resultPage) {
        // Generate the JSON
        var json = JSONUtils.encodeBookWithPage(output.getBook(), resultPage);

        // Write it to the disk
        return Writer.writePage(
            output,
            page,
            JSON.stringify(json, null, 4),
            {
                extension: '.json'
            }
        );
    });
}

module.exports = onPage;
