var path = require('path');

var PathUtils = require('../../utils/path');
var LocationUtils = require('../../utils/location');

var OUTPUT_EXTENSION = '.html';

/**
 * Convert a filePath (absolute) to a filename for output
 *
 * @param {Output} output
 * @param {String} filePath
 * @return {String}
 */
function fileToOutput(output, filePath) {
    var book = output.getBook();
    var readme = book.getReadme();
    var fileReadme = readme.getFile();

    if (
        path.basename(filePath, path.extname(filePath)) == 'README' ||
        (fileReadme.exists() && filePath == fileReadme.getPath())
    ) {
        filePath = path.join(path.dirname(filePath), 'index' + OUTPUT_EXTENSION);
    } else {
        filePath = PathUtils.setExtension(filePath, OUTPUT_EXTENSION);
    }

    return LocationUtils.normalize(filePath);
}

module.exports = fileToOutput;
