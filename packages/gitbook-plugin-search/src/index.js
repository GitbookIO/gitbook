const GitBook = require('gitbook-core');

const SearchInput = require('./components/Input');
const SearchResults = require('./components/Results');
const reducers = require('./reducers');

module.exports = GitBook.createPlugin(
    (dispatch, state) => {
        dispatch(GitBook.registerComponent(SearchInput, { role: 'search:input' }));
        dispatch(GitBook.registerComponent(SearchResults, { role: 'search:results' }));
    },
    reducers
);
