var path = require('path');
var fs = require('../../utils/fs');

/**
    Write a file to the output folder

    @param {Output} output
    @param {String} filePath
    @param {Buffer|String} content
    @return {Promise}
*/
function writeFile(output, filePath, content) {
    var rootFolder = output.getRoot();
    filePath = path.join(rootFolder, filePath);

    return fs.ensureFile(filePath)
    .then(function() {
        return fs.writeFile(filePath, content);
    })
    .thenResolve(output);
}

module.exports = writeFile;
