
/**
    Return a JSON representation of a file

    @param {File} file
    @return {Object}
*/
function encodeFileToJson(file) {
    return {
        path: file.getPath(),
        mtime: file.getMTime(),
        type: file.getType()
    };
}

module.exports = encodeFileToJson;
