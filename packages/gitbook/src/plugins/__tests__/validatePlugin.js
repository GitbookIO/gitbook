const Promise = require('../../utils/promise');
const Plugin = require('../../models/plugin');
const validatePlugin = require('../validatePlugin');

describe('validatePlugin', function() {
    it('must not validate a not loaded plugin', function() {
        const plugin = Plugin.createFromString('test');

        return validatePlugin(plugin)
        .then(function() {
            throw new Error('Should not be validate');
        }, function(err) {
            return Promise();
        });
    });
});
