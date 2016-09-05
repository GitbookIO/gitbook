const togglePlugin = require('../togglePlugin');
const Config = require('../../../models/config');

describe('togglePlugin', function() {
    const config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should enable plugin', function() {
        const newConfig = togglePlugin(config, 'disabled');

        const testDep = newConfig.getPluginDependency('disabled');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeTruthy();
    });

    it('should disable plugin', function() {
        const newConfig = togglePlugin(config, 'world');

        const testDep = newConfig.getPluginDependency('world');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeFalsy();
    });
});

