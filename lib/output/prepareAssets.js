var Parse = require('../parse');

/**
    List all assets in the book

    @param {Output}
    @return {Promise<Output>}
*/
function prepareAssets(output) {
    var book = output.getBook();
    var pages = output.getPages();

    return Parse.listAssets(book, pages)
    .then(function(assets) {
        return output.set('assets', assets);
    });
}

module.exports = prepareAssets;
