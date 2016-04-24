var nunjucks = require('nunjucks');

var Loader = nunjucks.Loader.extend({
    async: true,

});

module.exports = Loader;
