var encodeFile = require('./encodeFile');

/**
    Encode a languages listing to JSON

    @param {Languages}
    @return {Object}
*/
function encodeLanguages(languages) {
    var file = languages.getFile();
    var list = languages.getList();

    return {
        file: encodeFile(file),
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
