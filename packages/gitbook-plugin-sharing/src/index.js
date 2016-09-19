const GitBook = require('gitbook-core');
const ShareButton = require('./Button');

module.exports = GitBook.createPlugin((dispatch, state) => {
    dispatch(GitBook.registerComponent(ShareButton, { role: 'Toolbar:ActionButton' }));
});
