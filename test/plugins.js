var mock = require('./mock');
var registry = require('../lib/plugins/registry');
var Output = require('../lib/output/base');
var PluginsManager = require('../lib/plugins');

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

    describe('Loading', function() {
        it('should load default plugins', function() {
            return mock.outputDefaultBook(Output)
            .then(function(output) {
                output.plugins.count().should.be.greaterThan(0);
            });
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

        it('should correctly install all dependencies (if none)', function() {
            return mock.setupBook({})
            .then(function(book) {
                var plugins = new PluginsManager(book);
                return plugins.install()
                .should.be.fulfilledWith(0);
            });
        });

        it('should correctly install all dependencies (if any)', function() {
            return mock.setupBook({
                'book.json': {
                    plugins: ['ga']
                }
            })
            .then(function(book) {
                return book.config.load()
                .then(function() {
                    var plugins = new PluginsManager(book);
                    return plugins.install();
                });
            })
            .should.be.fulfilledWith(1);
        });
    });
});

