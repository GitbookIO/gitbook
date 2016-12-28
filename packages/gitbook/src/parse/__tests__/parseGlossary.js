const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');

describe('parseGlossary', () => {
    const parseGlossary = require('../parseGlossary');

    it('should parse glossary if exists', () => {
        const fs = createMockFS({
            'GLOSSARY.md': '# Glossary\n\n## Hello\nDescription for hello'
        });
        const book = Book.createForFS(fs);

        return parseGlossary(book)
        .then((resultBook) => {
            const glossary = resultBook.getGlossary();
            const file = glossary.getFile();
            const entries = glossary.getEntries();

            expect(file.exists()).toBeTruthy();
            expect(entries.size).toBe(1);
        });
    });

    it('should not fail if doesn\'t exist', () => {
        const fs = createMockFS({});
        const book = Book.createForFS(fs);

        return parseGlossary(book)
        .then((resultBook) => {
            const glossary = resultBook.getGlossary();
            const file = glossary.getFile();

            expect(file.exists()).toBeFalsy();
        });
    });
});
