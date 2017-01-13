const Book = require('../book');
const File = require('../file');
const Readme = require('../readme');
const Summary = require('../summary');
const Glossary = require('../glossary');

function createMockBook(def) {
    return new Book({
        readme: new Readme({
            file: new File({ path: def.readme })
        }),

        summary: new Summary({
            file: new File({ path: def.summary })
        }),

        glossary: new Glossary({
            file: new File({ path: def.glossary })
        })
    });
}

describe('Book', () => {
    describe('getDefaultExt', () => {
        it('must infer from README', () => {
            const book = createMockBook({
                readme: 'README.adoc',
                summary: 'SUMMARY.md',
                glossary: 'GLOSSARY.md'
            });

            expect(book.getDefaultExt()).toBe('.adoc');
        });

        it('must infer from SUMMARY', () => {
            const book = createMockBook({
                readme: '',
                summary: 'SUMMARY.adoc',
                glossary: 'GLOSSARY.md'
            });

            expect(book.getDefaultExt()).toBe('.adoc');
        });

        it('must infer from GLOSSARY', () => {
            const book = createMockBook({
                readme: '',
                summary: '',
                glossary: 'GLOSSARY.adoc'
            });

            expect(book.getDefaultExt()).toBe('.adoc');
        });

        it('must default to .md', () => {
            const book = createMockBook({
                readme: '',
                summary: '',
                glossary: ''
            });

            expect(book.getDefaultExt()).toBe('.md');
        });
    });
});
