const composeReducer = require('../lib/composeReducer');
const createReducer = require('../lib/createReducer');

module.exports = composeReducer(
    createReducer('components', require('./components')),
    createReducer('navigation', require('./navigation')),
    createReducer('i18n', require('./i18n')),
    // GitBook JSON
    createReducer('page', require('./page')),
    createReducer('summary', require('./summary')),
    createReducer('readme', require('./readme'))
);
