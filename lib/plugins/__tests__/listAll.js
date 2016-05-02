var PluginDependency = require('../../models/pluginDependency');
var listAll = require('../listAll');

describe('listAll', function() {
    it('must list default', function() {
        var deps = PluginDependency.listFromString('ga,great');
        var plugins = listAll(deps);

        expect(plugins.size).toBe(8);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(true);

        expect(plugins.has('search')).toBe(true);
    });

    it('must list from array with -', function() {
        var deps = PluginDependency.listFromString('ga,-great');
        var plugins = listAll(deps);

        expect(plugins.size).toBe(7);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(false);
    });

    it('must remove default plugins using -', function() {
        var deps = PluginDependency.listFromString('ga,-search');
        var plugins = listAll(deps);

        expect(plugins.size).toBe(6);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('search')).toBe(false);
    });
});
