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


    describe('Multilingual book', function() {
        var book;

        before(function() {
            return mock.setupBook({
                'LANGS.md': '# Languages\n\n'
                    + '* [English](./en)\n'
                    + '* [French](./fr)\n\n',
                'en/README.md': '# English',
                'en/SUMMARY.md': '# Summary',
                'fr/README.md': '# French',
                'fr/SUMMARY.md': '# Summary'
            })
            .then(function(_book) {
                book = _book;
                return book.parse();
            });
        });

        it('should list language books', function() {
            book.isMultilingual().should.equal(true);
            book.books.should.have.lengthOf(2);
        });
    });
});

