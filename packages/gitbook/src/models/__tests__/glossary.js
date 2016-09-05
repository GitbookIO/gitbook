const File = require('../file');
const Glossary = require('../glossary');
const GlossaryEntry = require('../glossaryEntry');

describe('Glossary', function() {
    const glossary = Glossary.createFromEntries(File(), [
        {
            name: 'Hello World',
            description: 'Awesome!'
        },
        {
            name: 'JavaScript',
            description: 'This is a cool language'
        }
    ]);

    describe('createFromEntries', function() {
        it('must add all entries', function() {
            const entries = glossary.getEntries();
            expect(entries.size).toBe(2);
        });

        it('must add entries as GlossaryEntries', function() {
            const entries = glossary.getEntries();
            const entry = entries.get('hello-world');
            expect(entry instanceof GlossaryEntry).toBeTruthy();
        });
    });

    describe('toText', function() {
        it('return as markdown', function() {
            return glossary.toText('.md')
            .then(function(text) {
                expect(text).toContain('# Glossary');
            });
        });
    });
});

