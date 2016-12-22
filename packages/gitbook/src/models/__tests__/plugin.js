describe('Plugin', function() {
    const Plugin = require('../plugin');

    describe('createFromString', function() {
        it('must parse name', function() {
            const plugin = Plugin.createFromString('hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('*');
        });

        it('must parse version', function() {
            const plugin = Plugin.createFromString('hello@1.0.0');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('1.0.0');
        });
    });

    describe('isLoaded', function() {
        it('must return false for empty plugin', function() {
            const plugin = Plugin.createFromString('hello');
            expect(plugin.isLoaded()).toBe(false);
        });

    });
});

