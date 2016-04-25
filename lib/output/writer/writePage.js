var path = require('path');
var Immutable = require('immutable');

var fs = require('../../utils/fs');
var PathUtils = require('../../utils/path');

var WriteOptions = Immutable.Record({
    extension: '.html'
});

/**
    Write a file to the output folder

    @param {Output} output
    @param {Page} page
    @param {Buffer|String} content
    @return {Promise}
*/
function writePage(output, page, content, options) {
    var file = page.getFile();
    var outputOpts = output.getOptions();
    var rootFolder = outputOpts.get('root');

    options = WriteOptions(options);

    // Get filename for file to write
    var fileName = PathUtils.setExtension(file.getPath(), options.get('extension'));
    var filePath = path.join(rootFolder, fileName);

    return fs.ensure(filePath)
    .then(function() {
        return fs.writeFile(filePath, content);
    })
    .thenResolve(output);
}

module.exports = writePage;
