var extend = require('extend');

var common = require('./browser');

module.exports = extend({
    initBook:       require('./init'),
    createNodeFS:   require('./fs/node'),
    Output:         require('./output'),
    commands:       require('./cli')
}, common);
