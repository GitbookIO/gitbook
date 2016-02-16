var mock = require('./mock');
var registry = require('../lib/plugins/registry');

describe('Plugins', function() {
    var book;

    before(function() {
        return mock.setupBook({})
        .then(function(_book) {
            book = _book;
        });
    });

    describe('Resolve Version', function() {

        it('should resolve a plugin version', function() {
            return registry.resolve('ga')
            .should.be.fulfilled();
        });

    });

    describe('Installation', function() {

        it('should install a plugin from NPM without a specific version', function() {
            return registry.install(book, 'ga')
            .should.be.fulfilled();
        });

        it('should install a plugin from NPM with a specific version', function() {
            return registry.install(book, 'ga', '1.0.0')
            .should.be.fulfilled();
        });

    });
});

