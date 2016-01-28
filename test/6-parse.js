var mock = require('./mock');

describe('Parsing', function() {
    it('should fail without SUMMARY', function() {
        return mock.setupBook({
            'README.md': ''
        })
        .then(function(book) {
            return book.parse().should.be.rejected;
        });
    });

    it('should fail without README', function() {
        return mock.setupBook({
            'SUMMARY.md': ''
        })
        .then(function(book) {
            return book.parse().should.be.rejected;
        });
    });
});

