var util = require('util');
var FolderOutput = require('../folder');
var ConrefsLoader = require('../conrefs');

var Theme = require('./theme');

function WebsiteOutput() {
    FolderOutput.apply(this, arguments);
    ConrefsLoader.apply(this);
}
util.inherits(WebsiteOutput, FolderOutput);
util.inherits(WebsiteOutput, ConrefsLoader);

WebsiteOutput.prototype.name = 'website';

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {

};

module.exports = WebsiteOutput;
