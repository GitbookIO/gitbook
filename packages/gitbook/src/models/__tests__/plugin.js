describe('Plugin', () => {
    const Plugin = require('../plugin');

    describe('createFromString', () => {
        it('must parse name', () => {
            const plugin = Plugin.createFromString('hello');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('*');
        });

        it('must parse version', () => {
            const plugin = Plugin.createFromString('hello@1.0.0');
            expect(plugin.getName()).toBe('hello');
            expect(plugin.getVersion()).toBe('1.0.0');
        });
    });

    describe('isLoaded', () => {
        it('must return false for empty plugin', () => {
            const plugin = Plugin.createFromString('hello');
            expect(plugin.isLoaded()).toBe(false);
        });

    });
});

