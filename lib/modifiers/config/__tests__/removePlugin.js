var removePlugin = require('../removePlugin');
var Config = require('../../../models/config');

describe('removePlugin', function() {
    var config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });

    it('should remove the plugin from the list', function() {
        var newConfig = removePlugin(config, 'hello');

        var testDep = newConfig.getPluginDependency('hello');
        expect(testDep).toNotBeDefined();
    });

    it('should remove the disabled plugin from the list', function() {
        var newConfig = removePlugin(config, 'disabled');

        var testDep = newConfig.getPluginDependency('disabled');
        expect(testDep).toNotBeDefined();
    });

    it('should disable default plugin', function() {
        var newConfig = removePlugin(config, 'search');

        var disabledDep = newConfig.getPluginDependency('search');
        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });
});


