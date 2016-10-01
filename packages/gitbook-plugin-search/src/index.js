const GitBook = require('gitbook-core');

const SearchInput = require('./components/Input');
const SearchResults = require('./components/Results');
const reducers = require('./reducers');
const Search = require('./actions/search');

module.exports = GitBook.createPlugin({
    init: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(SearchInput, { role: 'search:input' }));
        dispatch(Components.registerComponent(SearchResults, { role: 'search:results' }));
    },
    reduce: reducers,
    actions: {
        Search
    }
});
