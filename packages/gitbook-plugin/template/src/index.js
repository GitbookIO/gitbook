const GitBook = require('gitbook-core');

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState) => {
        // Dispatch initialization actions
    },
    deactivate: (dispatch, getState) => {
        // Dispatch cleanup actions
    },
    reduce: (state, action) => state
});
