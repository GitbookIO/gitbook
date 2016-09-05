const path = require('path');
const fs = require('../../utils/fs');

/**
    Resolve path to cover file to use

    @param {Output}
    @return {String}
*/
function getCoverPath(output) {
    const outputRoot = output.getRoot();
    const book = output.getBook();
    const config = book.getConfig();
    const coverName = config.getValue('cover', 'cover.jpg');

    // Resolve to absolute
    let cover = fs.pickFile(outputRoot, coverName);
    if (cover) {
        return cover;
    }

    // Multilingual? try parent folder
    if (book.isLanguageBook()) {
        cover = fs.pickFile(path.join(outputRoot, '..'), coverName);
    }

    return cover;
}

module.exports = getCoverPath;
