const GitBook = require('gitbook-core');

module.exports = GitBook.composeReducer(
    GitBook.createReducer('sidebar', require('./sidebar'))
);
