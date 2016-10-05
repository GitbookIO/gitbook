const GitBook = require('gitbook-core');
const reduce = require('./reducer');
const actions = require('./actions');

/**
 * Search in the local index
 * @param  {String} query
 * @return {Promise<List>}
 */
function searchHandler(query, dispatch) {
    return dispatch(actions.fetch())
    .then(() => {
        return [];
    });
}

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Search }) => {
        dispatch(Search.registerHandler('lunr', searchHandler));
    },
    reduce
});
