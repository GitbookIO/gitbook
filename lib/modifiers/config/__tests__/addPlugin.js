var addPlugin = require('../addPlugin');
var Config = require('../../../models/config');

describe('addPlugin', function() {
    var config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should have correct state of dependencies', function() {
        var disabledDep = config.getPluginDependency('disabled');

        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });

    it('should add the plugin to the list', function() {
        var newConfig = addPlugin(config, 'test');

        var testDep = newConfig.getPluginDependency('test');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeTruthy();

        var disabledDep = newConfig.getPluginDependency('disabled');
        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });
});


