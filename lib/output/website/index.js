var util = require('util');
var Output = require('../base');

function WebsiteOutput() {
    Output.apply(this, arguments);
}
util.inherits(WebsiteOutput, Output);

// Copy an asset file
WebsiteOutput.prototype.writeAsset = function(filename) {
    return this.copyFile(
        this.book.resolve(filename),
        filename
    );
};

// Write a page (parsable file)
WebsiteOutput.prototype.writePage = function(page) {

};

module.exports = WebsiteOutput;
