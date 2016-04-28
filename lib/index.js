var extend = require('extend');

var common = require('./browser');
var Output = require('./output');
var cli = require('./cli');
var initBook = require('./initBook');

module.exports = extend({
    initBook:       initBook,
    createNodeFS:   require('./fs/node'),
    Output:         Output,
    commands:       cli.commands
}, common);
