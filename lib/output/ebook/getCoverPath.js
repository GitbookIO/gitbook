var path = require('path');
var fs = require('../../utils/fs');

/**
    Resolve path to cover file to use

    @param {Output}
    @return {String}
*/
function getCoverPath(output) {
    var outputRoot = output.getRoot();
    var book = output.getBook();
    var config = book.getConfig();
    var cover = config.getValue('cover', 'cover.jpg');

    // Resolve to absolute
    cover = fs.pickFile(outputRoot, cover);
    if (cover) {
        return cover;
    }

    // Multilingual? try parent folder
    if (book.isLanguageBook()) {
        cover = fs.pickFile(path.join(outputRoot, '..'), cover);
    }

    return cover;
}

module.exports = getCoverPath;
