var extend = require('extend');

var common = require('./browser');
var Output = require('./output');
var cli = require('./cli');

module.exports = extend({
    Output: Output,
    commands: cli.commands
}, common);
