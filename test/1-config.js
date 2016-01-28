var mock = require('./mock');

describe('Config', function() {

    describe('No configuration', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook()
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should signal that configuration is not defined', function() {
            book.config.exists().should.not.be.ok();
        });
    });

    describe('JSON file', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'book.json': { title: 'Hello World' }
            })
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should correctly extend configuration', function() {
            book.config.get('title', '').should.equal('Hello World');
        });
    });

    describe('JS file', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'book.js': 'module.exports = { title: "Hello World" };'
            })
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should correctly extend configuration', function() {
            book.config.get('title', '').should.equal('Hello World');
        });
    });
});

