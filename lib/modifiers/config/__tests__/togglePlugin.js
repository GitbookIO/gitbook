var togglePlugin = require('../togglePlugin');
var Config = require('../../../models/config');

describe('togglePlugin', function() {
    var config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should enable plugin', function() {
        var newConfig = togglePlugin(config, 'disabled');

        var testDep = newConfig.getPluginDependency('disabled');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeTruthy();
    });

    it('should disable plugin', function() {
        var newConfig = togglePlugin(config, 'world');

        var testDep = newConfig.getPluginDependency('world');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeFalsy();
    });
});


