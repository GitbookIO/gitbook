const GitBook = require('gitbook-core');

const TYPES = {
    LOAD: 'lunr/load'
};

/**
 * Load an index set
 * @param {JSON} json
 * @return {Action}
 */
function load(json) {
    return { type: TYPES.LOAD, json };
}

/**
 * Fetch an index
 * @return {Action}
 */
function fetch() {
    return (dispatch, getState) => {
        const { idx } = getState().lunr;

        if (idx) {
            return GitBook.Promise.resolve();
        }

        return GitBook.Promise.resolve()
        .then(() => {
            // TODO: resolve the file correctly
            return window.fetch('search_index.json');
        })
        .then(response => response.json())
        .then(json => dispatch(load(json)));
    };
}

module.exports = {
    TYPES,
    fetch
};
