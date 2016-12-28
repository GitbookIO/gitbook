const Promise = require('../../utils/promise');
const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');

describe('parseReadme', () => {
    const parseReadme = require('../parseReadme');

    it('should parse summary if exists', () => {
        const fs = createMockFS({
            'README.md': '# Hello\n\nAnd here is the description.'
        });
        const book = Book.createForFS(fs);

        return parseReadme(book)
        .then((resultBook) => {
            const readme = resultBook.getReadme();
            const file = readme.getFile();

            expect(file.exists()).toBeTruthy();
            expect(readme.getTitle()).toBe('Hello');
            expect(readme.getDescription()).toBe('And here is the description.');
        });
    });

    it('should fail if doesn\'t exist', () => {
        const fs = createMockFS({});
        const book = Book.createForFS(fs);

        return parseReadme(book)
        .then((resultBook) => {
            throw new Error('It should have fail');
        }, () => {
            return Promise();
        });
    });
});
