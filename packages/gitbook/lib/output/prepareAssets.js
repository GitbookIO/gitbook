var Parse = require('../parse');

/**
    List all assets in the book

    @param {Output}
    @return {Promise<Output>}
*/
function prepareAssets(output) {
    var book = output.getBook();
    var pages = output.getPages();
    var logger = output.getLogger();

    return Parse.listAssets(book, pages)
    .then(function(assets) {
        logger.info.ln('found', assets.size, 'asset files');

        return output.set('assets', assets);
    });
}

module.exports = prepareAssets;
