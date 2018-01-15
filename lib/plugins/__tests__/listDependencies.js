var PluginDependency = require('../../models/pluginDependency');
var listDependencies = require('../listDependencies');
var toNames = require('../toNames');

describe('listDependencies', function() {
    it('must list default', function() {
        var deps = PluginDependency.listFromString('ga,great');
        var plugins = listDependencies(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'great',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must list from array with -', function() {
        var deps = PluginDependency.listFromString('ga,-great');
        var plugins = listDependencies(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must remove default plugins using -', function() {
        var deps = PluginDependency.listFromString('ga,-search');
        var plugins = listDependencies(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });
});
