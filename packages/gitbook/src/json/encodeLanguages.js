const encodeFile = require('./encodeFile');

/**
 * Encode a languages listing to JSON
 *
 * @param  {Languages} languages
 * @param  {URIIndex} urls
 * @return {JSON} json
*/
function encodeLanguages(languages, urls) {
    const file = languages.getFile();
    const list = languages.getList();

    return {
        file: encodeFile(file, urls),
        list: list
            .valueSeq()
            .map(function(lang) {
                return {
                    id: lang.getID(),
                    title: lang.getTitle()
                };
            }).toJS()
    };
}

module.exports = encodeLanguages;
