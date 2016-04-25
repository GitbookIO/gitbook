var path = require('path');
var fs = require('../../utils/fs');

/**
    Copy an asset to the outptu folder

    @param {Output} output
    @param {Page} page
*/
function onAsset(output, asset) {
    var book = output.getBook();
    var options = output.getOptions();

    var rootFolder = book.getRoot();
    var outputFolder = options.get('root');

    var filePath = path.resolve(rootFolder, asset);
    var outputPath = path.resolve(outputFolder, asset);

    return fs.copy(filePath, outputPath);
}

module.exports = onAsset;
