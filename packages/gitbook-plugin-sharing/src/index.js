const GitBook = require('gitbook-core');
const SharingButtons = require('./components/SharingButtons');

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Dispatch initialization actions
        dispatch(Components.registerComponent(SharingButtons, { role: 'toolbar:buttons:right' }));
    }
});
