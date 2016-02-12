var util = require('util');
var Output = require('./base');
var gitbook = require('../gitbook');

function JSONOutput() {
    Output.apply(this, arguments);
}
util.inherits(JSONOutput, Output);

// Write a page (parsable file)
JSONOutput.prototype.writePage = function(page) {
    var that = this;

    // Parse the page
    return page.parse()

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
