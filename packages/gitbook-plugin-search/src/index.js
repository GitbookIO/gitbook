const GitBook = require('gitbook-core');

const SearchInput = require('./components/Input');
const SearchResults = require('./components/Results');
const reducers = require('./reducers');
const Search = require('./actions/search');

const onLocationChange = (location, dispatch) => {
    const { query } = location;
    const q = query.get('q');

    dispatch(Search.handleQuery(q));
};

module.exports = GitBook.createPlugin({
    init: (dispatch, getState, { Navigation, Components }) => {
        // Register the navigation handler
        dispatch(Navigation.listen(onLocationChange));

        // Register components
        dispatch(Components.registerComponent(SearchInput, { role: 'search:input' }));
        dispatch(Components.registerComponent(SearchResults, { role: 'search:results' }));
    },
    reduce: reducers,
    actions: {
        Search
    }
});
