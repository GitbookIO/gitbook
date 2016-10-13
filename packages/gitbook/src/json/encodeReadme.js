const encodeFile = require('./encodeFile');

/**
 * Encode a readme to JSON.
 *
 * @param  {Readme} readme
 * @param  {URIIndex} urls
 * @return {JSON} json
 */
function encodeReadme(readme, urls) {
    const file = readme.getFile();

    return {
        file: encodeFile(file, urls)
    };
}

module.exports = encodeReadme;
