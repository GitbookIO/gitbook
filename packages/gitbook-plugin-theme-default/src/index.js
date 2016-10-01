const GitBook = require('gitbook-core');

const Theme = require('./components/Theme');
const reduceState = require('./reducers');
const locales = require('./i18n');


module.exports = GitBook.createPlugin({
    init: (dispatch, state, { Components, I18n }) => {
        dispatch(Components.registerComponent(Theme, { role: 'Body' }));
        dispatch(I18n.registerLocales(locales));
    },
    reduce: reduceState
});
