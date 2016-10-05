const path = require('path');
const fs = require('../../utils/fs');

/**
 * Copy an asset to the output folder
 *
 * @param {Output} output
 * @param {Page} page
 * @return {Output} output
 */
function onAsset(output, asset) {
    const book    = output.getBook();
    const options = output.getOptions();
    const bookFS  = book.getContentFS();

    const outputFolder = options.get('root');
    const outputPath   = path.resolve(outputFolder, asset);

    return fs.ensureFile(outputPath)
    .then(function() {
        return bookFS.readAsStream(asset)
        .then(function(stream) {
            return fs.writeStream(outputPath, stream);
        });
    })
    .thenResolve(output);
}

module.exports = onAsset;
