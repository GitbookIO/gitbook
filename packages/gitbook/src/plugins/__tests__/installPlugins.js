const tmp = require('tmp');

const Book = require('../../models/book');
const MockFS = require('../../fs/mock');
const installPlugins = require('../installPlugins');

const Parse = require('../../parse');

describe('installPlugins', () => {
    let book, dir;

    before(() => {
        dir = tmp.dirSync({ unsafeCleanup: true });

        const fs = MockFS({
            'book.json': JSON.stringify({ plugins: ['ga', 'sitemap' ]})
        }, dir.name);
        const baseBook = Book.createForFS(fs)
            .setLogLevel('disabled');

        return Parse.parseConfig(baseBook)
        .then((_book) => {
            book = _book;
        });
    });

    after(() => {
        dir.removeCallback();
    });

    it('must install all plugins from NPM', () => {
        return installPlugins(book)
        .then(function(n) {
            expect(n).toBe(2);
        });
    });
});
