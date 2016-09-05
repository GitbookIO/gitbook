const PluginDependency = require('../../models/pluginDependency');
const listDependencies = require('../listDependencies');
const toNames = require('../toNames');

describe('listDependencies', function() {
    it('must list default', function() {
        const deps = PluginDependency.listFromString('ga,great');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'great',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must list from array with -', function() {
        const deps = PluginDependency.listFromString('ga,-great');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'search', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });

    it('must remove default plugins using -', function() {
        const deps = PluginDependency.listFromString('ga,-search');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga',
            'highlight', 'lunr', 'sharing', 'fontsettings',
            'theme-default' ]);
    });
});
