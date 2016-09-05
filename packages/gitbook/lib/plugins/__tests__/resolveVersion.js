var PluginDependency = require('../../models/pluginDependency');
var resolveVersion = require('../resolveVersion');

describe('resolveVersion', function() {
    it('must skip resolving and return non-semver versions', function() {
        var plugin = PluginDependency.createFromString('ga@git+ssh://samy@github.com/GitbookIO/plugin-ga.git');

        return resolveVersion(plugin)
        .then(function(version) {
            expect(version).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
        });
    });

    it('must resolve a normal plugin dependency', function() {
        var plugin = PluginDependency.createFromString('ga@>0.9.0 < 1.0.1');

        return resolveVersion(plugin)
        .then(function(version) {
            expect(version).toBe('1.0.0');
        });
    });
});
