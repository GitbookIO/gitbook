jest.autoMockOff();

describe('Glossary', function() {
    var File = require('../file');
    var Glossary = require('../glossary');
    var GlossaryEntry = require('../glossaryEntry');

    describe('createFromEntries', function() {
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
});


