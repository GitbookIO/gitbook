var JSONUtils = require('../../json');
var Modifiers = require('../modifiers');
var Writer = require('../writer');
var getModifiers = require('../getModifiers');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    return Modifiers.modifyHTML(page, getModifiers(output, page))
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
