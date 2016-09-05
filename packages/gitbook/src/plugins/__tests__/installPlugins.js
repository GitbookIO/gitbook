const path = require('path');

const Book = require('../../models/book');
const NodeFS = require('../../fs/node');
const installPlugins = require('../installPlugins');

const Parse = require('../../parse');

describe('installPlugins', function() {
    let book;

    this.timeout(30000);

    before(function() {
        const fs = NodeFS(path.resolve(__dirname, '../../../'));
        const baseBook = Book.createForFS(fs);

        return Parse.parseConfig(baseBook)
        .then(function(_book) {
            book = _book;
        });
    });

    it('must install all plugins from NPM', function() {
        return installPlugins(book)
        .then(function(n) {
            expect(n).toBe(2);
        });
    });
});
