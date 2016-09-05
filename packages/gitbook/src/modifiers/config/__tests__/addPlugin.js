const addPlugin = require('../addPlugin');
const Config = require('../../../models/config');

describe('addPlugin', function() {
    const config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should have correct state of dependencies', function() {
        const disabledDep = config.getPluginDependency('disabled');

        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });

    it('should add the plugin to the list', function() {
        const newConfig = addPlugin(config, 'test');

        const testDep = newConfig.getPluginDependency('test');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeTruthy();

        const disabledDep = newConfig.getPluginDependency('disabled');
        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });
});

