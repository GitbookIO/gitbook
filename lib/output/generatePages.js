var Promise = require('../utils/promise');

/**
    Output all pages using a generator

    @param {Generator} generator
    @param {Output} output
    @return {Promise<Output>}
*/
function generatePages(generator, output) {
    var pages = output.getPages();

    // Is generator ignoring assets?
    if (!generator.onPage) {
        return Promise(output);
    }

    return Promise.reduce(pages, function(out, assetFile) {
        return generator.onPage(out, assetFile);
    }, output);
}

module.exports = generatePages;
