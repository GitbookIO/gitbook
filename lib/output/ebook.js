var util = require('util');

var WebsiteOutput = require('./website');
var assetsInliner = require('./assets-inliner');

function EbookOutput() {
    WebsiteOutput.apply(this, arguments);
}
util.inherits(EbookOutput, WebsiteOutput);

EbookOutput.prototype.name = 'ebook';


module.exports = assetsInliner(EbookOutput);
