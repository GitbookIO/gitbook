const common = require('./browser');

module.exports = {
    ...common,
    initBook:     require('./init'),
    createNodeFS: require('./fs/node'),
    Output:       require('./output'),
    commands:     require('./cli')
};
