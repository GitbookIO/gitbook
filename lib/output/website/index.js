var util = require('util');
var ConrefsLoader = require('../conrefs');

var Theme = require('./theme');

function WebsiteOutput() {
    ConrefsLoader.apply(this, arguments);
}
util.inherits(WebsiteOutput, ConrefsLoader);

WebsiteOutput.prototype.name = 'website';

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {

};

module.exports = WebsiteOutput;
