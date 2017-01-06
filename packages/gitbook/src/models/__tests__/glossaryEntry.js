const GlossaryEntry = require('../glossaryEntry');

describe('GlossaryEntry', () => {
    describe('getID', () => {
        it('must return a normalized ID', () => {
            const entry = new GlossaryEntry({
                name: 'Hello World'
            });

            expect(entry.id).toBe('hello-world');
        });
    });
});
