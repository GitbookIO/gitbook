const Promise = require('../../utils/promise');
const Plugin = require('../../models/plugin');
const validatePlugin = require('../validatePlugin');

describe('validatePlugin', () => {
    it('must not validate a not loaded plugin', () => {
        const plugin = Plugin.createFromString('test');

        return validatePlugin(plugin)
        .then(() => {
            throw new Error('Should not be validate');
        }, (err) => {
            return Promise();
        });
    });
});
