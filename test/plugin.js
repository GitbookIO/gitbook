var _ = require('lodash');
var path = require('path');
var assert = require('assert');

var Plugin = require('../').generate.Plugin;

describe('Plugin validation', function () {
    var plugin = new Plugin("plugin", __dirname);

    it('should be valid', function() {
        assert(plugin.isValid());
    });
});

describe('Plugins list', function () {
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

    it('should accept version', function() {
        var _name = "test@0.3.0,exercises@1.2.0,test2";
        var plugins = Plugin.normalizeList(_name);

        assert(_.find(plugins, {'name': "test"}).version = "0.3.0");
        assert(_.find(plugins, {'name': "exercises"}).version = "1.2.0");
        assert(!_.find(plugins, {'name': "test2"}).version);
    });
});

describe('Plugin defaults loading', function () {
    var ret = true;

    beforeEach(function(done){
        Plugin.fromList(Plugin.defaults, __dirname)
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
