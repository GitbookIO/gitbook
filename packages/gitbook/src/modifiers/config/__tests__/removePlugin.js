const removePlugin = require('../removePlugin');
const Config = require('../../../models/config');

describe('removePlugin', () => {
    const config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should remove the plugin from the list', () => {
        const newConfig = removePlugin(config, 'hello');

        const testDep = newConfig.getPluginDependency('hello');
        expect(testDep).toNotBeDefined();
    });

    it('should remove the disabled plugin from the list', () => {
        const newConfig = removePlugin(config, 'disabled');

        const testDep = newConfig.getPluginDependency('disabled');
        expect(testDep).toNotBeDefined();
    });

    it('should disable default plugin', () => {
        const newConfig = removePlugin(config, 'search');

        const disabledDep = newConfig.getPluginDependency('search');
        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });
});

