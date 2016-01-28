var util = require('util');
var Generator = require('./base');

function WebsiteGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(WebsiteGenerator, Generator);

// Copy an asset file
WebsiteGenerator.prototype.writeAsset = function(filename) {
    var that = this;

    return that.book.readFile(filename)
    .then(function(buf) {
        return that.output.writeFile(filename, buf);
    });
};

// Write a page (parsable file)
WebsiteGenerator.prototype.writePage = function(page) {

};




module.exports = WebsiteGenerator;
