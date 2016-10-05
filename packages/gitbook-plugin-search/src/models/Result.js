const GitBook = require('gitbook-core');
const { Record } = GitBook.Immutable;

const DEFAULTS = {
    url:   String(''),
    title: String(''),
    body:  String('')
};

class Result extends Record(DEFAULTS) {
    constructor(spec) {
        if (!spec.url || !spec.title) {
            throw new Error('"url" and "title" are required to create a search result');
        }

        super(spec);
    }
}

module.exports = Result;
