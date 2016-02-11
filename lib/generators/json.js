var util = require('util');
var Generator = require('./base');
var gitbook = require('../gitbook');

function JSONGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(JSONGenerator, Generator);

// Write a page (parsable file)
JSONGenerator.prototype.writePage = function(page) {
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
            sections: page.content.sections
        };

        return that.output.writeFile(
            page.withExtension('.json'),
            JSON.stringify(json, null, 4)
        );
    });
};

// At the end of generation, generate README.json for multilingual books
JSONGenerator.prototype.finish = function() {
    if (!this.book.isMultilingual()) return;

    // Copy README.json from main book
    var mainLanguage = this.book.langs.getDefault().id;
    return this.output.copyFile(
        this.output.resolve(mainLanguage, 'README.json'),
        'README.json'
    );
};


module.exports = JSONGenerator;
