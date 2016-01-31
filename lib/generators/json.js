var util = require('util');
var Generator = require('./base');

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
        var json = {};

        return that.output.writeFile(
            page.withExtension('.json'),
            JSON.stringify(json, null, 4)
        );
    });
};




module.exports = JSONGenerator;
