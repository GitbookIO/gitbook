const GitBook = require('gitbook-core');
const lunr = require('lunr');

/**
 * Search in the local index
 * @param  {String} query
 * @return {Promise<List>}
 */
function searchHandler(query) {
    return [
        { title: 'Hello world' }
    ];
}

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Search }) => {
        dispatch(Search.registerHandler('lunr', searchHandler));
    },
    reduce: (state, action) => state
});
