describe('PluginDependency', function() {
    var PluginDependency = require('../pluginDependency');

    describe('createFromString', function() {
        it('must parse name', function() {
            var plugin = PluginDependency.createFromString('hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('*');
        });

        it('must parse state', function() {
            var plugin = PluginDependency.createFromString('-hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.isEnabled()).toBe(false);
        });

        describe('Version', function() {
            it('must parse version', function() {
                var plugin = PluginDependency.createFromString('hello@1.0.0');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('1.0.0');
            });

            it('must parse semver', function() {
                var plugin = PluginDependency.createFromString('hello@>=4.0.0');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('>=4.0.0');
            });
        });

        describe('GIT Version', function() {
            it('must handle HTTPS urls', function() {
                var plugin = PluginDependency.createFromString('hello@git+https://github.com/GitbookIO/plugin-ga.git');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('git+https://github.com/GitbookIO/plugin-ga.git');
            });

            it('must handle SSH urls', function() {
                var plugin = PluginDependency.createFromString('hello@git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
            });
        });
    });
});


