var mock = require('./mock');

describe('Langs', function() {
    it('should parse empty langs', function() {
        return mock.setupDefaultBook({
            'LANGS.md': ''
        })
        .then(function(book) {
            return book.prepareConfig()

            .then(function() {
                return book.langs.load();
            })

            .then(function() {
                book.langs.count().should.equal(0);
            });
        });
    });

    it('should parse languages list', function() {
        return mock.setupDefaultBook({
            'LANGS.md': '# Languages\n\n'
                + '* [en](./en)\n'
                + '* [fr](./fr)\n\n'
        })
        .then(function(book) {
            return book.langs.load()
            .then(function() {
                book.langs.count().should.equal(2);
            });
        });
    });
});

