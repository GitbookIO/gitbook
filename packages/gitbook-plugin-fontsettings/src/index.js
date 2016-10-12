const GitBook = require('gitbook-core');
const FontButton = require('./components/FontButton');
const font = require('./actions/font');
const reduce = require('./reducers');

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Dispatch initialization actions
        dispatch(Components.registerComponent(FontButton, { role: 'toolbar:buttons:left' }));
    },
    actions: { font },
    reduce
});
