var encodeFile = require('./encodeFile');

/**
    Encode a readme to JSON

    @param {Readme}
    @return {Object}
*/
function encodeReadme(readme) {
    var file = readme.getFile();

    return {
        file: encodeFile(file)
    };
}

module.exports = encodeReadme;
