const path = require('path');
const LocationUtils = require('../../utils/location');

const fileToOutput = require('./fileToOutput');

/**
 * Convert a filePath (absolute) to an url (without hostname).
 * It returns an absolute path.
 *
 * "README.md" -> "/"
 * "test/hello.md" -> "test/hello.html"
 * "test/README.md" -> "test/"
 *
 * @param {Output} output
 * @param {String} filePath
 * @return {String}
 */
function fileToURL(output, filePath) {
    const options = output.getOptions();
    const directoryIndex = options.get('directoryIndex');

    filePath = fileToOutput(output, filePath);

    if (directoryIndex && path.basename(filePath) == 'index.html') {
        filePath = path.dirname(filePath) + '/';
    }

    return LocationUtils.normalize(filePath);
}

module.exports = fileToURL;
