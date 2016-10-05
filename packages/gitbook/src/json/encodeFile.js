
/**
 * Return a JSON representation of a file
 *
 * @param {File} file
 * @param {String} url?
 * @return {Object} json
 */
function encodeFileToJson(file, url) {
    const filePath = file.getPath();
    if (!filePath) {
        return undefined;
    }

    return {
        path:  filePath,
        mtime: file.getMTime(),
        type:  file.getType(),
        url
    };
}

module.exports = encodeFileToJson;
