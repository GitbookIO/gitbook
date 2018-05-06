var Immutable = require('immutable');
var Promise = require('../../utils/promise');
var Plugin = require('../../models/plugin');
var validatePlugin = require('../validatePlugin');

describe('validatePlugin', function() {

    var validPlugin = Plugin.createFromString('test')
        .set('package', Immutable.Map({
            // plugins are considered loaded if package.size > 0
            size: 1,
            name: 'name',
            engines: Immutable.Map({
                gitbook: '>=3.0.0'
            })
        }));

    it('must not validate a not loaded plugin', function() {
        var plugin = Plugin.createFromString('test');

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validated');
        }, function(err) {
            return Promise();
        });
    });

    it('must not validate a plugin without a package name', function() {
        var plugin = validPlugin;
        var package = plugin.get('package');

        plugin = plugin.set('package', package.merge({ name: undefined }));

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validated');
        }, function(err) {
            return  Promise();
        });
    });

    it('must not validate a plugin without defined "engines"', function() {
        var plugin = validPlugin;
        var package = plugin.get('package');

        plugin = plugin.set('package', package.merge({ engines: undefined }));

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validated');
        }, function(err) {
            return  Promise();
        });
    });

    it('must not validate a plugin without "gitbook" defined in "engines" field', function() {
        var plugin = validPlugin;
        var package = plugin.get('package');

        plugin = plugin.set('package', package.merge({ engines: { node: '>=3.0.0' } }));

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validated');
        }, function(err) {
            return  Promise();
        });
    });

    it('must validate valid plugins', function() {
        var plugin = validPlugin;
        return validatePlugin(plugin)
        .then(function() {
            return Promise();
        }, function(err) {
            throw new Error('Should be validated');
        });
    });
});
