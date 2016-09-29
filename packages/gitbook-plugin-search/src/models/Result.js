const GitBook = require('gitbook-core');
const { Record } = GitBook.Immutable;

const Result = Record({
    url:   String(''),
    title: String(''),
    body:  String('')
});

module.exports = Result;
