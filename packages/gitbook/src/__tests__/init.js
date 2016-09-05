const tmp = require('tmp');
const initBook = require('../init');

describe('initBook', function() {

    it('should create a README and SUMMARY for empty book', function() {
        const dir = tmp.dirSync();

        return initBook(dir.name)
        .then(function() {
            expect(dir.name).toHaveFile('README.md');
            expect(dir.name).toHaveFile('SUMMARY.md');
        });
    });

});
