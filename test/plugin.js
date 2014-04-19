var fs = require('fs');
var path = require('path');
var assert = require('assert');

var Plugin = require('../').generate.Plugin;

describe('Plugin loading', function () {
    var plugin = new Plugin("gitbook-plugin");

    it('should be valid', function() {
        assert(plugin.isValid());
    });
});
