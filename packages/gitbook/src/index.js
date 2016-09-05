const extend = require('extend');

const common = require('./browser');

module.exports = extend({
    initBook:       require('./init'),
    createNodeFS:   require('./fs/node'),
    Output:         require('./output'),
    commands:       require('./cli')
}, common);
