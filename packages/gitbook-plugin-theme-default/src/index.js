const GitBook = require('gitbook-core');

const Theme = require('./components/Theme');
const reduceState = require('./reducers');
const locales = require('./i18n');


module.exports = GitBook.createPlugin({
    activate: (dispatch, state, { Components, I18n }) => {
        dispatch(Components.registerComponent(Theme, { role: 'website:body' }));
        dispatch(I18n.registerLocales(locales));
    },
    reduce: reduceState
});
