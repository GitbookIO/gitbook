var fs = require('fs');
var path = require('path');
var assert = require('assert');

var Plugin = require('../').generate.Plugin;

describe('Plugin validation', function () {
    var plugin = new Plugin("gitbook-plugin");

    it('should be valid', function() {
        assert(plugin.isValid());
    });
});

describe('Plugin defaults loading', function () {
    var ret = true;

    beforeEach(function(done){
        Plugin.fromList(Plugin.defaults)
        .then(function(_r) {
            ret = _r;
        }, function(err) {
            ret = null;
        })
        .fin(done);
    });
    

    it('should load defaults addons', function() {
        assert(ret != null);
    });
});
