var util = require('util');
var FolderOutput = require('../base');

var Theme = require('./theme');

function WebsiteOutput() {
    FolderOutput.apply(this, arguments);
}
util.inherits(WebsiteOutput, FolderOutput);

WebsiteOutput.prototype.name = 'ebook';

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {

};

module.exports = WebsiteOutput;
