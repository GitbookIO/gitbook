var path = require('path');

var Promise = require('../../utils/promise');
var fs = require('../../utils/fs');

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

    // Copy README.json from it
    return fs.copy(
        path.resolve(outputRoot, mainLanguage.getID(), 'README.json'),
        path.resolve(outputRoot, 'README.json')
    )
    .thenResolve(output);
}

module.exports = onFinish;
