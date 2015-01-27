var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var fs = require("fs");

var Plugin = require("../lib/plugin");

var PLUGINS_ROOT = path.resolve(__dirname, "plugins");

describe('Plugins', function () {
    describe('invalid plugin', function() {
        it('should signal as invalid', function() {
            var plugin = new Plugin(books[0], "invalid");
            plugin.load("./invalid", PLUGINS_ROOT);
            assert(!plugin.isValid());
        });
    });

    describe('empty plugin', function() {
        var plugin = new Plugin(books[0], "invalid");
        plugin.load("./empty", PLUGINS_ROOT);

        it('should valid a plugin', function() {
            assert(plugin.isValid());
        });

        it('should return an empty list of resources', function(done) {
            qdone(
                plugin.getResources()
                .then(function(resources) {
                    _.each(Plugin.RESOURCES, function(resName) {
                        assert.equal(resources[resName].length, 0);
                    });
                }),
                done);
        });
    });

    describe('filters', function() {
        var plugin = new Plugin(books[0], "filters");
        plugin.load("./filters", PLUGINS_ROOT);

        before(function(done) {
            qdone(books[0].plugins.load(plugin), done);
        });

        it('should valid a plugin', function() {
            assert(plugin.isValid());
        });

        it('should return a map of filters', function() {
            var filters = plugin.getFilters();
            assert.equal(_.size(filters), 2);
            assert(filters["hello"]);
            assert(filters["helloCtx"]);
        });

        it('should correctly extend template filters', function(done) {
            qdone(
                books[0].template.renderString('{{ "World"|hello }}')
                .then(function(content) {
                    assert.equal(content, "Hello World");
                }),
                done
            );
        });

        it('should correctly set book as context', function(done) {
            qdone(
                books[0].template.renderString('{{ "root"|helloCtx }}')
                .then(function(content) {
                    assert.equal(content, "root:"+books[0].root);
                }),
                done
            );
        });
    });

    describe('blocks', function() {
        var plugin = new Plugin(books[0], "blocks");
        plugin.load("./blocks", PLUGINS_ROOT);

        before(function(done) {
            qdone(books[0].plugins.load(plugin), done);
        });

        it('should valid a plugin', function() {
            assert(plugin.isValid());
        });

        it('should correctly extend template blocks', function(done) {
            qdone(
                books[0].template.renderString('{% test %}hello{% endtest %}')
                .then(function(content) {
                    assert.equal(content, "testhellotest");
                }),
                done
            );
        });

        it('should correctly accept shortcuts', function(done) {
            qdone(
                books[0].template.renderString('$$hello$$')
                .then(function(content) {
                    assert.equal(content, "testhellotest");
                }),
                done
            );
        });

        it('should correctly extend template blocks with defined end', function(done) {
            qdone(
                books[0].template.renderString('{% test2 %}hello{% endtest2end %}')
                .then(function(content) {
                    assert.equal(content, "test2hellotest2");
                }),
                done
            );
        });

        it('should correctly extend template blocks with sub-blocks', function(done) {
            qdone(
                books[0].template.renderString('{% test3join separator=";" %}hello{% also %}world{% endtest3join %}')
                .then(function(content) {
                    assert.equal(content, "hello;world");
                }),
                done
            );
        });

        it('should correctly extend template blocks with different sub-blocks', function(done) {
            qdone(
                books[0].template.renderString('{% test4join separator=";" %}hello{% also %}the{% finally %}world{% endtest4join %}')
                .then(function(content) {
                    assert.equal(content, "hello;the;world");
                }),
                done
            );
        });
    });
});
