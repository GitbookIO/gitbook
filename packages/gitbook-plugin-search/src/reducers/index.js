const GitBook = require('gitbook-core');

module.exports = GitBook.createReducer('search', require('./search'));
