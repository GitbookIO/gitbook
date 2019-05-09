var path = require('path');

var Promise = require('../../utils/promise');
var fs = require('../../utils/fs');
var JSONUtils = require('../../json');

/**
    Finish the generation

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    var book = output.getBook();
    var outputRoot = output.getRoot();

    if (!book.isMultilingual()) {
        return Promise(output);
    }

    // Get main language
    var languages = book.getLanguages();
    var mainLanguage = languages.getDefaultLanguage();

    // Read the main JSON
    return fs.readFile(path.resolve(outputRoot, mainLanguage.getID(), 'README.json'), 'utf8')

    // Extend the JSON
    .then(function(content) {
        var json = JSON.parse(content);

        json.languages = JSONUtils.encodeLanguages(languages);

        return json;
    })

    .then(function(json) {
        return fs.writeFile(
            path.resolve(outputRoot, 'README.json'),
            JSON.stringify(json, null, 4)
        );
    })

    .thenResolve(output);
}

module.exports = onFinish;
