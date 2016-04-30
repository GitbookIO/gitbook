jest.autoMockOff();

var Promise = require('../../utils/promise');
var Plugin = require('../../models/plugin');


describe('validatePlugin', function() {
    var validatePlugin = require('../validatePlugin');

    pit('must not validate a not loaded plugin', function() {
        var plugin = Plugin.createFromString('test');

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validate');
        }, function(err) {
            return Promise();
        });
    });

});
