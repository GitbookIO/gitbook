var util = require('util');
var Output = require('../base');

function WebsiteOutput() {
    Output.apply(this, arguments);
}
util.inherits(WebsiteOutput, Output);

// Write a page (parsable file)
WebsiteOutput.prototype.writePage = function(page) {

};

module.exports = WebsiteOutput;
