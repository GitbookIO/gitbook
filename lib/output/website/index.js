var util = require('util');
var FolderOutput = require('../base');

function WebsiteOutput() {
    FolderOutput.apply(this, arguments);
}
util.inherits(WebsiteOutput, FolderOutput);

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {

};

module.exports = WebsiteOutput;
