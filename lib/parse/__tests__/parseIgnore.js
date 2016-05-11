var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');

describe('parseIgnore', function() {
    var parseIgnore = require('../parseIgnore');
    var fs = createMockFS({
        '.ignore': 'test-1.js',
        '.gitignore': 'test-2.js\ntest-3.js',
        '.bookignore': '!test-3.js',
        'test-1.js': '1',
        'test-2.js': '2',
        'test-3.js': '3'
    });

    function getBook() {
        var book = Book.createForFS(fs);
        return parseIgnore(book);
    }

    it('should load rules from .ignore', function() {
        return getBook()
        .then(function(book) {
            expect(book.isFileIgnored('test-1.js')).toBeTruthy();
        });
    });

    it('should load rules from .gitignore', function() {
        return getBook()
        .then(function(book) {
            expect(book.isFileIgnored('test-2.js')).toBeTruthy();
        });
    });

    it('should load rules from .bookignore', function() {
        return getBook()
        .then(function(book) {
            expect(book.isFileIgnored('test-3.js')).toBeFalsy();
        });
    });
});
