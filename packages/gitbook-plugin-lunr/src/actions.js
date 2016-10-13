const GitBook = require('gitbook-core');

const TYPES = {
    LOAD: 'lunr/load'
};
const INDEX_FILENAME = 'search_index.json';

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
        const { lunr, file } = getState();
        const { idx } = lunr;
        const filePath = file.relative(INDEX_FILENAME);

        if (idx) {
            return GitBook.Promise.resolve();
        }

        return GitBook.Promise.resolve()
        .then(() => {
            return window.fetch(filePath);
        })
        .then(response => response.json())
        .then(json => dispatch(load(json)));
    };
}

module.exports = {
    TYPES,
    fetch
};
