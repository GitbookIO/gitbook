const path = require('path');

const Promise = require('../../utils/promise');
const fs = require('../../utils/fs');
const JSONUtils = require('../../json');

/**
    Finish the generation

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    const book = output.getBook();
    const outputRoot = output.getRoot();

    if (!book.isMultilingual()) {
        return Promise(output);
    }

    // Get main language
    const languages = book.getLanguages();
    const mainLanguage = languages.getDefaultLanguage();

    // Read the main JSON
    return fs.readFile(path.resolve(outputRoot, mainLanguage.getID(), 'README.json'), 'utf8')

    // Extend the JSON
    .then(function(content) {
        const json = JSON.parse(content);

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
