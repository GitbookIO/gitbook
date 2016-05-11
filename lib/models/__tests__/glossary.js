var File = require('../file');
var Glossary = require('../glossary');
var GlossaryEntry = require('../glossaryEntry');

describe('Glossary', function() {
    var glossary = Glossary.createFromEntries(File(), [
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
            var entries = glossary.getEntries();
            expect(entries.size).toBe(2);
        });

        it('must add entries as GlossaryEntries', function() {
            var entries = glossary.getEntries();
            var entry = entries.get('hello-world');
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


