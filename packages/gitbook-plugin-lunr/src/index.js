const GitBook = require('gitbook-core');
const reduce = require('./reducer');
const actions = require('./actions');

/**
 * Search in the local index
 * @param  {String} query
 * @return {Promise<List>}
 */
function searchHandler(query, dispatch, getState) {
    // Fetch the index if non loaded
    return dispatch(actions.fetch())

    // Execute the search
    .then(() => {
        const { idx, store } = getState().lunr;
        const results = idx.search(query);

        return results.map(({ref}) => store.get(ref).toJS());
    });
}

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Search }) => {
        dispatch(Search.registerHandler('lunr', searchHandler));
    },
    reduce
});
