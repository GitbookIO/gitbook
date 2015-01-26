var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var fs = require("fs");

var Plugin = require("../lib/plugin");

var PLUGINS_ROOT = path.resolve(__dirname, "plugins");

describe('Plugins', function () {
    it('should correctly fail on invalid version', function() {
        var plugin = new Plugin(books[0], "invalid");
        plugin.load("./invalid", PLUGINS_ROOT);
        assert(!plugin.isValid());
    });

    it('should correctly valid a plugin', function() {
        var plugin = new Plugin(books[0], "invalid");
        plugin.load("./empty", PLUGINS_ROOT);
        assert(plugin.isValid());
    });
});
