var PluginDependency = require('../../models/pluginDependency');
var sortDependencies = require('../sortDependencies');
var toNames = require('../toNames');

describe('sortDependencies', function() {
    it('must load themes after plugins', function() {
        var allPlugins = PluginDependency.listFromArray([
            'hello',
            'theme-test',
            'world'
        ]);

        var sorted = sortDependencies(allPlugins);
        var names = toNames(sorted);

        expect(names).toEqual([
            'hello',
            'world',
            'theme-test'
        ]);
    });

    it('must keep order of themes', function() {
        var allPlugins = PluginDependency.listFromArray([
            'theme-test',
            'theme-test1',
            'hello',
            'theme-test2',
            'world'
        ]);
        var sorted = sortDependencies(allPlugins);
        var names = toNames(sorted);

        expect(names).toEqual([
            'hello',
            'world',
            'theme-test',
            'theme-test1',
            'theme-test2'
        ]);
    });
});