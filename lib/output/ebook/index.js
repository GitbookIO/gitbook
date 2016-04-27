var extend = require('extend');
var websiteGenerator = require('../website');

module.exports = extend({}, websiteGenerator, {
    name: 'ebook',
    onInit: require('./onInit'),
    onPage: require('./onPage'),
    onFinish: require('./onFinish')
});
