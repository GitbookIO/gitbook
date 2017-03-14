const Promise = require('../../utils/promise');
const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');
const parseReadme = require('../parseReadme');

describe('parseReadme', () => {
    it('should parse readme if exists', () => {
        const fs = createMockFS({
            'README.md': '# Hello\n\nAnd here is the description.'
        });
        const book = Book.createForFS(fs);

        return parseReadme(book)
        .then((resultBook) => {
            const readme = resultBook.getReadme();
            const file = readme.getFile();

            expect(file.exists()).toBeTruthy();
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
