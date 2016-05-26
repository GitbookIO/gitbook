var PluginDependency = require('../../models/pluginDependency');
var resolveVersion = require('../resolveVersion');

describe('resolveVersion', function() {
    it('must skip resolving and return non-semver versions', function(done) {
        var plugin = PluginDependency.createFromString('plugin-ga@git+ssh://samy@github.com/GitbookIO/plugin-ga.git');

        resolveVersion(plugin)
        .then(function(version) {
            expect(version).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
            done();
        });
    });
});
