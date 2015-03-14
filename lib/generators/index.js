var _ = require("lodash");
var EbookGenerator = require("./ebook");

module.exports = {
    json: require("./json"),
    website: require("./website"),
    ebook: EbookGenerator,
    pdf: _.partialRight(EbookGenerator, "pdf"),
    mobi: _.partialRight(EbookGenerator, "mobi"),
    epub: _.partialRight(EbookGenerator, "epub")
};
