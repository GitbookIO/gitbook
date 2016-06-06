var togglePlugin = require('../togglePlugin');
var Config = require('../../../models/config');
var Book = require('../../../models/book');

describe('togglePlugin', function() {
    var config = Config.createWithValues({
        plugins: ['hello', 'world', '-disabled']
    });
    var book = Book().setConfig(config);

    it('should enable plugin', function() {
        var newBook = togglePlugin(book, 'disabled');
        var newConfig = newBook.getConfig();

        var testDep = newConfig.getPluginDependency('disabled');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeTruthy();
    });

    it('should disable plugin', function() {
        var newBook = togglePlugin(book, 'world');
        var newConfig = newBook.getConfig();

        var testDep = newConfig.getPluginDependency('world');
        expect(testDep).toBeDefined();
        expect(testDep.getVersion()).toEqual('*');
        expect(testDep.isEnabled()).toBeFalsy();
    });
});


