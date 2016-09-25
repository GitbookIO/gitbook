const composeReducer = require('../composeReducer');
const createReducer = require('../createReducer');

module.exports = composeReducer(
    createReducer('components', require('./components')),
    createReducer('navigation', require('./navigation')),
    // GitBook JSON
    createReducer('page', require('./page')),
    createReducer('summary', require('./summary')),
    createReducer('readme', require('./readme'))
);
