var util = require('util');

var WebsiteOutput = require('./website');
var AssetsInliner = require('./assets-inliner');

function EbookOutput() {
    WebsiteOutput.apply(this, arguments);
    AssetsInliner.call(this);
}
util.inherits(EbookOutput, AssetsInliner);
util.inherits(EbookOutput, WebsiteOutput);

EbookOutput.prototype.name = 'ebook';


module.exports = EbookOutput;
