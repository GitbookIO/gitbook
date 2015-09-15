var _ = require('lodash');
var should = require('should');
var path = require('path');
var fs = require('fs');

var Plugin = require('../lib/plugin');
var parsers = require("gitbook-parsers");
var PLUGINS_ROOT = path.resolve(__dirname, 'plugins');

describe('Plugins', function () {
    var book;

    before(function() {
        return books.parse("basic")
            .then(function(_book) {
                book = _book;
            });
    });

    describe('Invalid', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "invalid");
            plugin.load("./invalid", PLUGINS_ROOT);
        });

        it('should be detected', function() {
            should(plugin.isValid()).be.exactly(false);
        });
    });

    describe('Empty', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "empty");
            plugin.load("./empty", PLUGINS_ROOT);
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

    describe('Resources', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "resources");
            plugin.load("./resources", PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        describe('Website', function() {
            it('should return a valid list of resources', function() {
                return plugin.getResources("website")
                    .then(function(resources) {
                        resources["js"].should.have.lengthOf(1);
                    });
            });

            it('should extend books plugins', function() {
                var resources = book.plugins.resources("website");
                resources["js"].should.have.lengthOf(1);
            });
        });

        describe('eBook', function() {
            it('should return a valid list of resources', function() {
                return plugin.getResources("ebook")
                    .then(function(resources) {
                        resources["css"].should.have.lengthOf(1);
                    });
            });

            it('should extend books plugins', function() {
                var resources = book.plugins.resources("ebook");

                // There is resources from highlight plugin and this plugin
                resources["css"].should.have.lengthOf(2);
                should.exist(_.find(resources["css"], {
                    path: './resources/test'
                }));
            });
        });
    });

    describe('Filters', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "filters");
            plugin.load("./filters", PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        it('should return a map of filters', function() {
            var filters = plugin.getFilters();

            _.size(filters).should.equal(2);
            filters.should.have.property("hello");
            filters.should.have.property("helloCtx");
        });

        it('should correctly extend template filters', function() {
            return book.template.renderString('{{ "World"|hello }}')
                .then(function(content) {
                    content.should.equal("Hello World");
                });
        });

        it('should correctly set book as context', function() {
            return book.template.renderString('{{ "root"|helloCtx }}')
                .then(function(content) {
                    content.should.equal("root:"+book.root);
                });
        });
    });

    describe('Blocks', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "blocks");
            plugin.load("./blocks", PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        var testTpl = function(str, args, options) {
            return book.template.renderString(str, args, options)
            .then(book.template.postProcess)
        };

        it('should valid a plugin', function() {
            should(plugin.isValid()).be.exactly(true);
        });

        it('should correctly extend template blocks', function() {
            return testTpl('{% test %}hello{% endtest %}')
                .then(function(content) {
                    content.should.equal("testhellotest");
                });
        });

        it('should correctly accept shortcuts', function() {
           return testTpl('$$hello$$', {}, {
                    type: "markdown"
                })
                .then(function(content) {
                    content.should.equal("testhellotest");
                });
        });

        it('should correctly extend template blocks with defined end', function() {
            return testTpl('{% test2 %}hello{% endtest2end %}')
                .then(function(content) {
                    content.should.equal("test2hellotest2");
                });
        });

        it('should correctly extend template blocks with sub-blocks', function() {
            return testTpl('{% test3join separator=";" %}hello{% also %}world{% endtest3join %}')
                .then(function(content) {
                    content.should.equal("hello;world");
                });
        });

        it('should correctly extend template blocks with different sub-blocks', function() {
            return testTpl('{% test4join separator=";" %}hello{% also %}the{% finally %}world{% endtest4join %}')
                .then(function(content) {
                    content.should.equal("hello;the;world");
                });
        });

        it('should correctly extend template blocks with arguments', function() {
            return testTpl('{% test5args "a", "b", "c" %}{% endtest5args %}')
                .then(function(content) {
                    content.should.equal("test5a,b,ctest5");
                });
        });

        it('should correctly extend template blocks with args and kwargs', function() {
            return testTpl('{% test5kwargs "a", "b", "c", d="test", e="test2" %}{% endtest5kwargs %}')
                .then(function(content) {
                    content.should.equal("test5a,b,c,d:test,e:test2,__keywords:truetest5");
                });
        });
    });

    describe('Blocks without parsing', function() {
        var plugin;

        before(function() {
            plugin = new Plugin(book, "blocks");
            plugin.load("./blocks", PLUGINS_ROOT);

            return book.plugins.load(plugin);
        });

        var testTpl = function(markup, str, args, options) {
            var filetype = parsers.get(markup);

            return book.template.renderString(str, args, options)
            .then(filetype.page).get('sections').get(0).get('content')
            .then(book.template.postProcess)
        };

        it('should correctly process unparsable for markdown', function() {
            return testTpl('.md', '{% test %}**hello**{% endtest %}')
                .then(function(content) {
                    content.should.equal("<p>test**hello**test</p>\n");
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

