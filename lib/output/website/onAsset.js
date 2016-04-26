var path = require('path');
var fs = require('../../utils/fs');

/**
    Copy an asset to the output folder

    @param {Output} output
    @param {Page} page
*/
function onAsset(output, asset) {
    var book = output.getBook();
    var options = output.getOptions();

    var rootFolder = book.getContentRoot();
    var outputFolder = options.get('root');

    var filePath = path.resolve(rootFolder, asset);
    var outputPath = path.resolve(outputFolder, asset);

    return fs.ensure(outputPath)
    .then(function() {
        return fs.copy(filePath, outputPath);
    })
    .thenResolve(output);
}

module.exports = onAsset;
