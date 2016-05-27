var PluginDependency = require('../../models/pluginDependency');
var sortPlugins = require('../sortPlugins');
var listAll = require('../listAll');
var THEME_PREFIX = require('../../constants/themePrefix');


/**
    Check if a plugin is a theme given its name

    @return {Boolean}
*/
function isTheme(name) {
    return (name && name.indexOf(THEME_PREFIX) === 0);
}

describe('sortPlugins', function() {
    it('must load themes after plugins', function() {
        var deps = PluginDependency.listFromString('theme-faq'),
            allPlugins = listAll(deps);

        return sortPlugins(allPlugins, [])
        .then(function(sorted) {
            var plugins = sorted.slice(0, -2),
                themes = sorted.slice(-2);

            var pluginsOk = plugins.every(function(plugin) {
                return !isTheme(plugin.getName());
            });

            var themesOk = themes.every(function(theme) {
                return isTheme(theme.getName());
            });

            expect(pluginsOk).toBe(true);
            expect(plugins.has('search')).toBe(true);

            expect(themesOk).toBe(true);
            expect(themes.size).toBe(2);
            expect(themes.has('theme-faq')).toBe(true);
            expect(themes.has('theme-default')).toBe(true);
        });
    });

    it('must load themes after plugins with a complex dependencies list', function() {
        var deps = PluginDependency.listFromString('comment,theme-faq,-search,ga'),
            allPlugins = listAll(deps);

        return sortPlugins(allPlugins, [])
        .then(function(sorted) {
            var plugins = sorted.slice(0, -2),
                themes = sorted.slice(-2);

            var pluginsOk = plugins.every(function(plugin) {
                return !isTheme(plugin.getName());
            });

            var themesOk = themes.every(function(theme) {
                return isTheme(theme.getName());
            });

            expect(pluginsOk).toBe(true);
            expect(plugins.has('search')).toBe(false);

            expect(themesOk).toBe(true);
            expect(themes.size).toBe(2);
            expect(themes.has('theme-faq')).toBe(true);
            expect(themes.has('theme-default')).toBe(true);
        });
    });
});