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

        it('should valid a plugin', function() {
            assert(plugin.isValid());
        });

        it('should return a map of filters', function() {
            var filters = plugin.getFilters();
            assert.equal(_.size(filters), 1);
            assert(filters["hello"]);
        });
    });
});
