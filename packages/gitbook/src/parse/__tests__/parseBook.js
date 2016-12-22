const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');

describe('parseBook', function() {
    const parseBook = require('../parseBook');

    it('should parse multilingual book', function() {
        const fs = createMockFS({
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'en': {
                'README.md': 'Hello'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        });
        const book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            const languages = resultBook.getLanguages();
            const books = resultBook.getBooks();

            expect(resultBook.isMultilingual()).toBe(true);
            expect(languages.getList().size).toBe(2);
            expect(books.size).toBe(2);
        });
    });

    it('should extend configuration for multilingual book', function() {
        const fs = createMockFS({
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'book.json': '{ "title": "Test", "author": "GitBook" }',
            'en': {
                'README.md': 'Hello',
                'book.json': '{ "title": "Test EN" }'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        });
        const book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            const books = resultBook.getBooks();

            expect(resultBook.isMultilingual()).toBe(true);
            expect(books.size).toBe(2);

            const en = books.get('en');
            const fr = books.get('fr');

            const enConfig = en.getConfig();
            const frConfig = fr.getConfig();

            expect(enConfig.getValue('title')).toBe('Test EN');
            expect(enConfig.getValue('author')).toBe('GitBook');

            expect(frConfig.getValue('title')).toBe('Test');
            expect(frConfig.getValue('author')).toBe('GitBook');
        });
    });

    it('should parse book in a directory', function() {
        const fs = createMockFS({
            'book.json': JSON.stringify({
                root: './test'
            }),
            'test': {
                'README.md': 'Hello World',
                'SUMMARY.md': '# Summary\n\n* [Page](page.md)\n',
                'page.md': 'Page'
            }
        });
        const book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            const readme = resultBook.getReadme();
            const summary = resultBook.getSummary();
            const articles = summary.getArticlesAsList();

            expect(summary.getFile().exists()).toBe(true);
            expect(readme.getFile().exists()).toBe(true);
            expect(articles.size).toBe(2);
        });
    });

});
