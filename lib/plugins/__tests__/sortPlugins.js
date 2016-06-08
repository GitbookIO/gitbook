var PluginDependency = require('../../models/pluginDependency');
var sortPlugins = require('../sortPlugins');
var listAll = require('../listAll');

describe('sortPlugins', function() {
    it('must load themes after plugins', function() {
        var deps = PluginDependency.listFromString('theme-faq'),
            allPlugins = listAll(deps);

        var sorted = sortPlugins(allPlugins, []);
        var names = sorted
            .map(function(plugin) {
                return plugin.getName();
            })
            .toArray();

        expect(names).toEqual([
            'fontsettings',
            'sharing',
            'lunr',
            'search',
            'highlight',
            'theme-faq',
            'theme-default'
        ]);
    });

    it('must load themes after plugins with a complex dependencies list', function() {
        var deps = PluginDependency.listFromString('comment,theme-faq,-search,ga'),
            allPlugins = listAll(deps);

        var sorted = sortPlugins(allPlugins, []);
        var names = sorted
            .map(function(plugin) {
                return plugin.getName();
            })
            .toArray();

        expect(names).toEqual([
            'ga',
            'comment',
            'fontsettings',
            'sharing',
            'lunr',
            'highlight',
            'theme-faq',
            'theme-default'
        ]);
    });
});