var util = require('util');
var Generator = require('../base');

function WebsiteGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(WebsiteGenerator, Generator);

// Copy an asset file
WebsiteGenerator.prototype.writeAsset = function(filename) {
    return this.output.copyFile(
        this.book.resolve(filename),
        filename
    );
};

// Write a page (parsable file)
WebsiteGenerator.prototype.writePage = function(page) {

};

module.exports = WebsiteGenerator;
