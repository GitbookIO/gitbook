var path = require('path');

var mock = require('./mock');
var registry = require('../lib/plugins/registry');
var Output = require('../lib/output/base');
var PluginsManager = require('../lib/plugins');
var BookPlugin = require('../lib/plugins/plugin');

var PLUGINS_ROOT = path.resolve(__dirname, 'node_modules');

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

    describe('Loading', function() {
        it('should load default plugins', function() {
            return mock.outputDefaultBook(Output)
            .then(function(output) {
                output.plugins.count().should.be.greaterThan(0);
            });
        });
    });

    describe('Configuration', function() {
        it('should fail loading a plugin with an invalid configuration', function() {
            var plugin = new BookPlugin(book, 'test-config');
            return plugin.load(PLUGINS_ROOT)
                .should.be.rejectedWith('Error with book\'s configuration: pluginsConfig.test-config.myProperty is required');
        });

        it('should extend configuration with default properties', function() {
            return mock.setupBook({
                'book.json': {
                    pluginsConfig: {
                        'test-config': {
                            'myProperty': 'world'
                        }
                    }
                }
            })
            .then(function(book2) {
                return book2.config.load()
                .then(function() {
                    var plugin = new BookPlugin(book2, 'test-config');
                    return plugin.load(PLUGINS_ROOT);
                })
                .then(function() {
                    book2.config.get('pluginsConfig.test-config.myDefaultProperty', '').should.equal('hello');
                });
            });
        });
    });
});

