var Immutable = require('immutable');

var Plugin = require('../../models/plugin');
var sortPlugins = require('../sortPlugins');

/**
 * Return list of plugin names
 * @param {OrderedMap<String:Plugin} plugins
 * @return {Array<String>}
 */
function toNames(plugins) {
    return plugins
        .map(function(plugin) {
            return plugin.getName();
        })
        .toArray();
}

describe.only('sortPlugins', function() {
    it('must load themes after plugins', function() {
        var allPlugins = Immutable.OrderedMap([
            ['hello', Plugin.createFromString('hello')],
            ['theme-test', Plugin.createFromString('theme-test')],
            ['world', Plugin.createFromString('world')]
        ]);

        var sorted = sortPlugins(allPlugins);
        var names = toNames(sorted);

        expect(names).toEqual([
            'hello',
            'world',
            'theme-test'
        ]);
    });

    it('must keep order of themes', function() {
        var allPlugins = Immutable.OrderedMap([
            ['theme-test', Plugin.createFromString('theme-test')],
            ['theme-test1', Plugin.createFromString('theme-test1')],
            ['hello', Plugin.createFromString('hello')],
            ['theme-test2', Plugin.createFromString('theme-test2')],
            ['world', Plugin.createFromString('world')]
        ]);

        var sorted = sortPlugins(allPlugins);
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