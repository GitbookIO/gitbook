var WebsiteOutput = require('./website');
var assetsInliner = require('./assets-inliner');

var EbookOutput = assetsInliner(WebsiteOutput);

EbookOutput.prototype.name = 'ebook';


module.exports = EbookOutput;
