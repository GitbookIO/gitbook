var mock = require('./mock');

describe('Readme', function() {

    describe('Parsing', function() {
        it('should parse empty readme', function() {
            return mock.setupDefaultBook({
                'README.md': ''
            })
            .then(function(book) {
                return book.prepareConfig()

                .then(function() {
                    return book.readme.load();
                });
            });
        });

        it('should parse readme', function() {
            return mock.setupDefaultBook({
                'README.md': '# Hello World\nThis is my book'
            })
            .then(function(book) {
                return book.readme.load()
                .then(function() {
                    book.readme.title.should.equal('Hello World');
                    book.readme.description.should.equal('This is my book');
                });
            });
        });
    });

});

