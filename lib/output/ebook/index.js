var extend = require('extend');
var WebsiteGenerator = require('../website');

module.exports = extend({}, WebsiteGenerator, {
    name: 'ebook',
    onInit: require('./onInit'),
    onPage: require('./onPage'),
    onFinish: require('./onFinish')
});
