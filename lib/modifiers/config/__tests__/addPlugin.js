var addPlugin = require('../addPlugin');
var Config = require('../../../models/config');
var Book = require('../../../models/book');

describe('addPlugin', function() {
    var config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });
    var book = Book().setConfig(config);

    it('should have correct state of dependencies', function() {
        var disabledDep = config.getPluginDependency('disabled');

        expect(disabledDep).toBeDefined();
        expect(disabledDep.getVersion()).toEqual('*');
        expect(disabledDep.isEnabled()).toBeFalsy();
    });

    it('should add the plugin to the list', function() {
        var newBook = addPlugin(book, 'test');
        var newConfig = newBook.getConfig();

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


