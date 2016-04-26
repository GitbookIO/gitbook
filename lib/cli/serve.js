var path = require('path');

var options = require('./options');
var getBook = require('./getBook');

var Parse = require('../parse');
var Output = require('../output');

module.exports = {
    name: 'serve [book] [output]',
    description: 'serve the book as a website for testing',
    options: [
        options.log,
        options.format
    ],
    exec: function(args, kwargs) {

    }
};
