const Immutable = require('immutable');
const PluginDependency = require('../pluginDependency');

describe('PluginDependency', function() {
    describe('createFromString', function() {
        it('must parse name', function() {
            const plugin = PluginDependency.createFromString('hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('*');
        });

        it('must parse state', function() {
            const plugin = PluginDependency.createFromString('-hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.isEnabled()).toBe(false);
        });

        describe('Version', function() {
            it('must parse version', function() {
                const plugin = PluginDependency.createFromString('hello@1.0.0');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('1.0.0');
            });

            it('must parse semver', function() {
                const plugin = PluginDependency.createFromString('hello@>=4.0.0');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('>=4.0.0');
            });
        });

        describe('GIT Version', function() {
            it('must handle HTTPS urls', function() {
                const plugin = PluginDependency.createFromString('hello@git+https://github.com/GitbookIO/plugin-ga.git');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('git+https://github.com/GitbookIO/plugin-ga.git');
            });

            it('must handle SSH urls', function() {
                const plugin = PluginDependency.createFromString('hello@git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
                expect(plugin.getName()).toBe('hello');
                expect(plugin.getVersion()).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
            });
        });

        describe('listToArray', function() {
            it('must create an array from a list of plugin dependencies', function() {
                const list = PluginDependency.listToArray(Immutable.List([
                    PluginDependency.createFromString('hello@1.0.0'),
                    PluginDependency.createFromString('noversion'),
                    PluginDependency.createFromString('-disabled')
                ]));

                expect(list).toEqual([
                    'hello@1.0.0',
                    'noversion',
                    '-disabled'
                ]);
            });
        });

        describe('listFromArray', function() {
            it('must create an array from a list of plugin dependencies', function() {
                const arr = Immutable.fromJS([
                    'hello@1.0.0',
                    {
                        'name': 'plugin-ga',
                        'version': 'git+ssh://samy@github.com/GitbookIO/plugin-ga.git'
                    }
                ]);
                const list = PluginDependency.listFromArray(arr);

                expect(list.first().getName()).toBe('hello');
                expect(list.first().getVersion()).toBe('1.0.0');
                expect(list.last().getName()).toBe('plugin-ga');
                expect(list.last().getVersion()).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
            });
        });
    });
});
