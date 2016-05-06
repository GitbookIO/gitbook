var path = require('path');

var options = require('./options');
var initBook = require('../init');

module.exports = {
    name: 'init [book]',
    description: 'setup and create files for chapters',
    options: [
        options.log
    ],
    exec: function(args, kwargs) {
        var bookRoot = path.resolve(process.cwd(), args[0] || './');

        return initBook(bookRoot);
    }
};
