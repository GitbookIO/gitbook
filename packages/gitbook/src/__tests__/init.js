const tmp = require('tmp');
const initBook = require('../init');

describe('initBook', () => {

    it('should create a README and SUMMARY for empty book', () => {
        const dir = tmp.dirSync();

        return initBook(dir.name)
        .then(() => {
            expect(dir.name).toHaveFile('README.md');
            expect(dir.name).toHaveFile('SUMMARY.md');
        });
    });

});
