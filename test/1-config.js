var mock = require('./mock');

describe('Config', function() {

    describe('config.load()', function() {
        it('should not fail if no configuration file', function() {
            return mock.setupDefaultBook()
            .then(function(book) {
                return book.prepareConfig();
            });
        });

        it('should load from a JSON file', function() {
            return mock.setupDefaultBook({
                'book.json': { title: 'Hello World' }
            })
            .then(function(book) {
                return book.prepareConfig()
                .then(function() {
                    book.config.get('title', '').should.equal('Hello World');
                });
            });
        });

        it('should load from a JS file', function() {
            return mock.setupDefaultBook({
                'book.js': 'module.exports = { title: "Hello World" };'
            })
            .then(function(book) {
                return book.prepareConfig()
                .then(function() {
                    book.config.get('title', '').should.equal('Hello World');
                });
            });
        });
    });

});

