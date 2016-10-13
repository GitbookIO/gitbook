
/**
 * Return a JSON representation of a file
 *
 * @param  {File} file
 * @param  {URIIndex} urls
 * @return {JSON} json
 */
function encodeFileToJson(file, urls) {
    const filePath = file.getPath();
    if (!filePath) {
        return undefined;
    }

    return {
        path:  filePath,
        mtime: file.getMTime(),
        type:  file.getType(),
        url:   urls.resolveToURL(filePath)
    };
}

module.exports = encodeFileToJson;
