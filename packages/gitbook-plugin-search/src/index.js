const GitBook = require('gitbook-core');

const SearchInput = require('./components/Input');
const SearchResults = require('./components/Results');
const reducers = require('./reducers');
const search = require('./actions/search');

module.exports = GitBook.createPlugin({
    init: (dispatch, getState) => {
        dispatch(GitBook.registerComponent(SearchInput, { role: 'search:input' }));
        dispatch(GitBook.registerComponent(SearchResults, { role: 'search:results' }));
    },
    reduce: reducers,
    actions: {
        search
    }
});
