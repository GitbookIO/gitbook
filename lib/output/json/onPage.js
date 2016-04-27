var JSONUtils = require('../../json');
var PathUtils = require('../../utils/path');
var Modifiers = require('../modifiers');
var writeFile = require('../helper/writeFile');
var getModifiers = require('../getModifiers');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    var file = page.getFile();

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the JSON
        var json = JSONUtils.encodeBookWithPage(output.getBook(), resultPage);

        // File path in the output folder
        var filePath = PathUtils.setExtension(file.getPath(), '.json');

        // Write it to the disk
        return writeFile(
            output,
            filePath,
            JSON.stringify(json, null, 4)
        );
    });
}

module.exports = onPage;
