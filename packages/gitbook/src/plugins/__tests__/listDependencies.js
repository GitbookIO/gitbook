const PluginDependency = require('../../models/pluginDependency');
const listDependencies = require('../listDependencies');
const toNames = require('../toNames');

describe('listDependencies', () => {
    it('must list default', () => {
        const deps = PluginDependency.listFromString('ga,great');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'great', 'highlight', 'search', 'lunr',
            'sharing', 'hints', 'headings', 'copy-code', 'fontsettings', 'theme-default'
        ]);
    });

    it('must list from array with -', () => {
        const deps = PluginDependency.listFromString('ga,-great');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'highlight', 'search', 'lunr',
            'sharing', 'hints', 'headings',
            'copy-code', 'fontsettings', 'theme-default'
        ]);
    });

    it('must remove default plugins using -', () => {
        const deps = PluginDependency.listFromString('ga,-search');
        const plugins = listDependencies(deps);
        const names = toNames(plugins);

        expect(names).toEqual([
            'ga', 'highlight', 'lunr', 'sharing',
            'hints', 'headings', 'copy-code', 'fontsettings', 'theme-default'
        ]);
    });
});
