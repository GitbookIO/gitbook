var extend = require('extend');
var WebsiteGenerator = require('../website');

module.exports = extend({}, WebsiteGenerator, {
    name: 'ebook',
    Options: require('./options'),
    onPage: require('./onPage'),
    onFinish: require('./onFinish')
});
