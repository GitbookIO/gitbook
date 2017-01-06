const PluginDependency = require('../../models/pluginDependency');
const resolveVersion = require('../resolveVersion');

describe('resolveVersion', () => {
    it('must skip resolving and return non-semver versions', () => {
        const plugin = PluginDependency.createFromString('ga@git+ssh://samy@github.com/GitbookIO/plugin-ga.git');

        return resolveVersion(plugin)
        .then((version) => {
            expect(version).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
        });
    });

    it('must resolve a normal plugin dependency', () => {
        const plugin = PluginDependency.createFromString('ga@>0.9.0 < 1.0.1');

        return resolveVersion(plugin)
        .then((version) => {
            expect(version).toBe('1.0.0');
        });
    });
});
