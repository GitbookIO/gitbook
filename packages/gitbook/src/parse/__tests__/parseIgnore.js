const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');

describe('parseIgnore', () => {
    const parseIgnore = require('../parseIgnore');
    const fs = createMockFS({
        '.ignore': 'test-1.js',
        '.gitignore': 'test-2.js\ntest-3.js',
        '.bookignore': '!test-3.js',
        'test-1.js': '1',
        'test-2.js': '2',
        'test-3.js': '3'
    });

    function getBook() {
        const book = Book.createForFS(fs);
        return parseIgnore(book);
    }

    it('should load rules from .ignore', () => {
        return getBook()
        .then((book) => {
            expect(book.isFileIgnored('test-1.js')).toBeTruthy();
        });
    });

    it('should load rules from .gitignore', () => {
        return getBook()
        .then((book) => {
            expect(book.isFileIgnored('test-2.js')).toBeTruthy();
        });
    });

    it('should load rules from .bookignore', () => {
        return getBook()
        .then((book) => {
            expect(book.isFileIgnored('test-3.js')).toBeFalsy();
        });
    });
});
