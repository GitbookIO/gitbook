const encodeFile = require('./encodeFile');

/**
 * Encode a languages listing to JSON
 *
 * @param  {Languages} languages
 * @param  {String} currentLanguage
 * @param  {URIIndex} urls
 * @return {JSON} json
*/
function encodeLanguages(languages, currentLanguage, urls) {
    const file = languages.getFile();
    const list = languages.getList();

    return {
        file: encodeFile(file, urls),
        current: currentLanguage,
        list: list
            .valueSeq()
            .map((lang) => {
                return {
                    id: lang.getID(),
                    title: lang.getTitle()
                };
            }).toJS()
    };
}

module.exports = encodeLanguages;
