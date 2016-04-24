var PathUtils = require('../utils/path');

/**
    Resolve an absolute path (extracted from a link)

    @param {Output} output
    @param {String} filePath
    @return {String}
*/
function resolveFile(output, filePath) {
    var pages = output.getPages();
    var page = pages.get(filePath);

    if (!page) {
        return filePath;
    }

    return PathUtils.setExtension(filePath, '.html');
}

module.exports = resolveFile;
