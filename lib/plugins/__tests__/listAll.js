var PluginDependency = require('../../models/pluginDependency');
var listAll = require('../listAll');
var toNames = require('../toNames');

describe('listAll', function() {
    it('must list default', function() {
        var deps = PluginDependency.listFromString('ga,great');
        var plugins = listAll(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'great',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must list from array with -', function() {
        var deps = PluginDependency.listFromString('ga,-great');
        var plugins = listAll(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must remove default plugins using -', function() {
        var deps = PluginDependency.listFromString('ga,-search');
        var plugins = listAll(deps);
        var names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });
});
