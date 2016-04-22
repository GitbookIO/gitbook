jest.autoMockOff();

describe('GlossaryEntry', function() {
    var GlossaryEntry = require('../glossaryEntry');

    describe('getID', function() {
        it('must return a normalized ID', function() {
            var entry = new GlossaryEntry({
                name: 'Hello World'
            });

            expect(entry.getID()).toBe('hello-world');
        });
    });
});


