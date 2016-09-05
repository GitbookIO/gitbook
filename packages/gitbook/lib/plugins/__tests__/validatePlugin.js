var Promise = require('../../utils/promise');
var Plugin = require('../../models/plugin');
var validatePlugin = require('../validatePlugin');

describe('validatePlugin', function() {
    it('must not validate a not loaded plugin', function() {
        var plugin = Plugin.createFromString('test');

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validate');
        }, function(err) {
            return Promise();
        });
    });
});
