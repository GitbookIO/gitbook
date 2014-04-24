var _ = require('lodash');
var path = require('path');
var assert = require('assert');

var Plugin = require('../').generate.Plugin;

describe('Plugin validation', function () {
    var plugin = new Plugin("plugin");

    it('should be valid', function() {
        assert(plugin.isValid());
    });
});

describe('Plugin list of names', function () {
    var firstDefault = _.first(Plugin.defaults);

    it('should convert string to array', function() {
        var _name = "test";
        assert(_.contains(Plugin.normalizeNames(_name), _name));
    });

    it('should contains default plugins', function() {
        assert(_.contains(Plugin.normalizeNames([]), firstDefault));
    });

    it('should remove name starting with -', function() {
        assert(!_.contains(Plugin.normalizeNames(["-"+firstDefault]), firstDefault));
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
