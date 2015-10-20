var _ = require('lodash');
var fs = require('fs');
var should = require('should');
var path = require('path');

var Plugin = require('../lib/plugin');
var parsers = require('gitbook-parsers');
var PLUGINS_ROOT = path.resolve(__dirname, 'plugins');

describe('Plugins', function () {
    var book;

    before(function() {
        return books.parse('basic')
        .then(function(_book) {
            book = _book;
        });
    });

    describe('Invalid', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'invalid');
            plugin.load('./invalid', PLUGINS_ROOT);
        });

        it('should be detected', function() {
            should(plugin.isValid()).be.exactly(false);
        });
    });

    describe('Empty', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'empty');
            plugin.load('./empty', PLUGINS_ROOT);
        });

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        it('should return an empty list of resources', function() {
            return plugin.getResources()
            .then(function(resources) {
                _.each(Plugin.RESOURCES, function(resName) {
                    resources[resName].should.have.lengthOf(0);
                });
            });
        });
    });

    describe('Configuration', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'testconfig');
            plugin.load('./config', PLUGINS_ROOT);
        });

        it('should throw error for invalid configuration', function() {
            return plugin.validateConfig({})
            .should.be.rejectedWith('Configuration Error: pluginsConfig.testconfig.testRequired is required');
        });

        it('should throw error for invalid types', function() {
            return plugin.validateConfig({
                testRequired: 'hello'
            })
            .should.be.rejectedWith('Configuration Error: pluginsConfig.testconfig.testRequired is not of a type(s) number');
        });

        it('should extend with default values', function() {
            return plugin.validateConfig({
                testRequired: 12
            })
            .should.be.fulfilledWith({
                hello: 'world',
                testRequired: 12
            });
        });
    });

    describe('Resources', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'resources');
            plugin.load('./resources', PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        describe('Website', function() {
            it('should return a valid list of resources', function() {
                return plugin.getResources('website')
                    .then(function(resources) {
                        resources.js.should.have.lengthOf(1);
                    });
            });

            it('should extend books plugins', function() {
                var resources = book.plugins.resources('website');
                resources.js.should.have.lengthOf(5);
            });
        });

        describe('eBook', function() {
            it('should return a valid list of resources', function() {
                return plugin.getResources('ebook')
                    .then(function(resources) {
                        resources.css.should.have.lengthOf(1);
                    });
            });

            it('should extend books plugins', function() {
                var resources = book.plugins.resources('ebook');

                // There is resources from highlight plugin and this plugin
                resources.css.should.have.lengthOf(2);
                should.exist(_.find(resources.css, {
                    path: 'gitbook-plugin-resources/test'
                }));
            });
        });
    });

    describe('Filters', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'filters');
            plugin.load('./filters', PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        it('should return a map of filters', function() {
            var filters = plugin.getFilters();

            _.size(filters).should.equal(2);
            filters.should.have.property('hello');
            filters.should.have.property('helloCtx');
        });

        it('should correctly extend template filters', function() {
            return book.template.renderString('{{ \'World\'|hello }}')
                .then(function(content) {
                    content.should.equal('Hello World');
                });
        });

        it('should correctly set book as context', function() {
            return book.template.renderString('{{ \'root\'|helloCtx }}')
                .then(function(content) {
                    content.should.equal('root:'+book.root);
                });
        });
    });

    describe('Blocks', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'blocks');
            plugin.load('./blocks', PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        var testTpl = function(str, args, options) {
            return book.template.renderString(str, args, options)
            .then(book.template.postProcess);
        };

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        it('should correctly extend template blocks', function() {
            return testTpl('{% test %}hello{% endtest %}')
                .then(function(content) {
                    content.should.equal('testhellotest');
                });
        });

        describe('Shortcuts', function() {
            it('should correctly accept shortcuts', function() {
                return testTpl('$$hello$$', {}, {
                    type: 'markdown'
                })
                .then(function(content) {
                    content.should.equal('testhellotest');
                });
            });

            it('should correctly apply shortcuts to included file', function() {
                return books.generate('conrefs', 'website', {
                    testId: 'include-plugins',
                    prepare: function(bookConref) {
                        plugin = new Plugin(bookConref, 'blocks');
                        plugin.load('./blocks', PLUGINS_ROOT);

                        return bookConref.plugins.load(plugin);
                    }
                })
                .then(function(bookConref) {
                    var readme = fs.readFileSync(
                        path.join(bookConref.options.output, 'index.html'),
                        { encoding: 'utf-8' }
                    );

                    readme.should.be.html({
                        '.page-inner p#test-plugin-block-shortcuts-1': {
                            count: 1,
                            text: 'testtest_block1test',
                            trim: true
                        },
                        '.page-inner p#test-plugin-block-shortcuts-2': {
                            count: 1,
                            text: 'testtest_block2test',
                            trim: true
                        }
                    });
                });
            });
        });


        it('should correctly extend template blocks with defined end', function() {
            return testTpl('{% test2 %}hello{% endtest2end %}')
                .then(function(content) {
                    content.should.equal('test2hellotest2');
                });
        });

        it('should correctly extend template blocks with sub-blocks', function() {
            return testTpl('{% test3join separator=";" %}hello{% also %}world{% endtest3join %}')
                .then(function(content) {
                    content.should.equal('hello;world');
                });
        });

        it('should correctly extend template blocks with different sub-blocks', function() {
            return testTpl('{% test4join separator=";" %}hello{% also %}the{% finally %}world{% endtest4join %}')
                .then(function(content) {
                    content.should.equal('hello;the;world');
                });
        });

        it('should correctly extend template blocks with arguments (1)', function() {
            return testTpl('{% test5args "a" %}{% endtest5args %}')
                .then(function(content) {
                    content.should.equal('test5atest5');
                });
        });

        it('should correctly extend template blocks with arguments (2)', function() {
            return testTpl('{% test5args "a", "b" %}{% endtest5args %}')
                .then(function(content) {
                    content.should.equal('test5a,btest5');
                });
        });

        it('should correctly extend template blocks with arguments (3)', function() {
            return testTpl('{% test5args "a", "b", "c" %}{% endtest5args %}')
                .then(function(content) {
                    content.should.equal('test5a,b,ctest5');
                });
        });

        it('should correctly extend template blocks with args and kwargs', function() {
            return testTpl('{% test5kwargs "a", "b", "c", d="test", e="test2" %}{% endtest5kwargs %}')
                .then(function(content) {
                    content.should.equal('test5a,b,c,d:test,e:test2,__keywords:truetest5');
                });
        });

        it('should correctly extend template blocks with access to context', function() {
            return testTpl('{% set name = "john" %}{% test6context %}{% endtest6context %}', {})
            .then(function(content) {
                content.should.equal('test6johntest6');
            });
        });
    });

    describe('Blocks without parsing', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, 'blocks');
            plugin.load('./blocks', PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        var testTpl = function(markup, str, args, options) {
            var filetype = parsers.get(markup);

            return book.template.renderString(str, args, options)
            .then(filetype.page).get('sections').get(0).get('content')
            .then(book.template.postProcess);
        };

        it('should correctly process unparsable for markdown', function() {
            return testTpl('.md', '{% test %}**hello**{% endtest %}')
                .then(function(content) {
                    content.should.equal('<p>test**hello**test</p>\n');
                });
        });

        it('should correctly process unparsable for asciidoc', function() {
            return testTpl('.adoc', '{% test %}**hello**{% endtest %}')
                .then(function(content) {
                    content.should.equal('<div class="paragraph">\n<p>test**hello**test</p>\n</div>');
                });
        });
    });
});

