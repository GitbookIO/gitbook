const GlossaryEntry = require('../glossaryEntry');

describe('GlossaryEntry', function() {
    describe('getID', function() {
        it('must return a normalized ID', function() {
            const entry = new GlossaryEntry({
                name: 'Hello World'
            });

            expect(entry.getID()).toBe('hello-world');
        });
    });
});

