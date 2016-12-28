const GlossaryEntry = require('../glossaryEntry');

describe('GlossaryEntry', () => {
    describe('getID', () => {
        it('must return a normalized ID', () => {
            const entry = new GlossaryEntry({
                name: 'Hello World'
            });

            expect(entry.getID()).toBe('hello-world');
        });
    });
});

