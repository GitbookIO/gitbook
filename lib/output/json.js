var util = require('util');
var FolderOutput = require('./folder');
var gitbook = require('../gitbook');

function JSONOutput() {
    FolderOutput.apply(this, arguments);
}
util.inherits(JSONOutput, FolderOutput);

// Don't copy asset on JSON output
JSONOutput.prototype.onAsset = function(filename) {

};

// Write a page (parsable file)
JSONOutput.prototype.onPage = function(page) {
    var that = this;

    // Parse the page
    return page.toHTML(this)

    // Write as json
    .then(function() {
        var json = {
            gitbook: {
                version: gitbook.version
            },
            path: page.path,
            sections: page.content
        };

        return that.writeFile(
            page.withExtension('.json'),
            JSON.stringify(json, null, 4)
        );
    });
};

// At the end of generation, generate README.json for multilingual books
JSONOutput.prototype.finish = function() {
    if (!this.book.isMultilingual()) return;

    // Copy README.json from main book
    var mainLanguage = this.book.langs.getDefault().id;
    return this.copyFile(
        this.resolve(mainLanguage, 'README.json'),
        'README.json'
    );
};


module.exports = JSONOutput;
