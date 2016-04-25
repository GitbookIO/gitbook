var Promise = require('../utils/promise');

/**
    Output all pages using a generator

    @param {Generator} generator
    @param {Output} output
    @return {Promise<Output>}
*/
function generatePages(generator, output) {
    var pages = output.getPages();
    var logger = output.getLogger();

    // Is generator ignoring assets?
    if (!generator.onPage) {
        return Promise(output);
    }

    return Promise.reduce(pages, function(out, page) {
        var file = page.getFile();

        logger.debug.ln('generate page "' + file.getPath() + '"');

        return generator.onPage(out, page);
    }, output);
}

module.exports = generatePages;
