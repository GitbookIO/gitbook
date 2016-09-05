var path = require('path');

/**
    Return path to output folder

    @param {Array} args
    @return {String}
*/
function getOutputFolder(args) {
    var bookRoot = path.resolve(args[0] || process.cwd());
    var defaultOutputRoot = path.join(bookRoot, '_book');
    var outputFolder = args[1]? path.resolve(process.cwd(), args[1]) : defaultOutputRoot;

    return outputFolder;
}

module.exports = getOutputFolder;
