var conrefsLoader = require('../conrefs');

var Theme = require('./theme');

var WebsiteOutput = conrefsLoader();

WebsiteOutput.prototype.name = 'website';

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {

};

module.exports = WebsiteOutput;
