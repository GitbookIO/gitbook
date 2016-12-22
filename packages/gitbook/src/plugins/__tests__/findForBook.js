const path = require('path');

const Book = require('../../models/book');
const createNodeFS = require('../../fs/node');
const findForBook = require('../findForBook');

describe('findForBook', () => {
    const fs = createNodeFS(
        path.resolve(__dirname, '../../..')
    );
    const book = Book.createForFS(fs);

    it('should list default plugins', () => {
        return findForBook(book)
        .then((plugins) => {
            expect(plugins.has('theme-default')).toBeTruthy();
        });
    });
});
