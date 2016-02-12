var _ = require('lodash');
//var EbookGenerator = require('./ebook');

module.exports = {
    json: require('./json'),
    /*website: require('./website'),
    pdf: _.partialRight(EbookGenerator, 'pdf'),
    mobi: _.partialRight(EbookGenerator, 'mobi'),
    epub: _.partialRight(EbookGenerator, 'epub')*/
};
