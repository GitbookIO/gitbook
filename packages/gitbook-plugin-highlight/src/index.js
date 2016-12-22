const GitBook = require('gitbook-core');
const CodeBlock = require('./CodeBlock');

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(CodeBlock, { role: 'html:code' }));
    },
    reduce: (state, action) => state
});
