var mock = require('./mock');

describe('Summary / Table of contents', function() {
    describe('Empty summary list', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({})
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should correctly count articles', function() {
            book.summary.count().should.equal(1);
        });
    });

    describe('Non-empty summary list', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'SUMMARY.md': '# Summary\n\n'
                    + '* [Hello](./hello.md)\n'
                    + '* [World](./world.md)\n\n'
            })
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should correctly count articles', function() {
            book.summary.count().should.equal(3);
        });
    });
});

