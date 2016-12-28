const File = require('../file');
const Glossary = require('../glossary');
const GlossaryEntry = require('../glossaryEntry');

describe('Glossary', () => {
    const glossary = Glossary.createFromEntries(new File(), [
        {
            name: 'Hello World',
            description: 'Awesome!'
        },
        {
            name: 'JavaScript',
            description: 'This is a cool language'
        }
    ]);

    describe('createFromEntries', () => {
        it('must add all entries', () => {
            const entries = glossary.getEntries();
            expect(entries.size).toBe(2);
        });

        it('must add entries as GlossaryEntries', () => {
            const entries = glossary.getEntries();
            const entry = entries.get('hello-world');
            expect(entry instanceof GlossaryEntry).toBeTruthy();
        });
    });

    describe('toText', () => {
        it('return as markdown', () => {
            return glossary.toText('.md')
            .then((text) => {
                expect(text).toContain('# Glossary');
            });
        });
    });
});
