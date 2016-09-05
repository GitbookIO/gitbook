const path = require('path');

const Book = require('../../models/book');
const createNodeFS = require('../../fs/node');
const findForBook = require('../findForBook');

describe('findForBook', function() {
    const fs = createNodeFS(
        path.resolve(__dirname, '../../..')
    );
    const book = Book.createForFS(fs);

    it('should list default plugins', function() {
        return findForBook(book)
        .then(function(plugins) {
            expect(plugins.has('fontsettings')).toBeTruthy();
        });
    });
});
