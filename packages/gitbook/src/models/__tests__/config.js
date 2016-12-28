const Immutable = require('immutable');
const Config = require('../config');

describe('Config', () => {
    const config = Config.createWithValues({
        hello: {
            world: 1,
            test: 'Hello',
            isFalse: false
        }
    });

    describe('getValue', () => {
        it('must return value as immutable', () => {
            const value = config.getValue('hello');
            expect(Immutable.Map.isMap(value)).toBeTruthy();
        });

        it('must return deep value', () => {
            const value = config.getValue('hello.world');
            expect(value).toBe(1);
        });

        it('must return default value if non existant', () => {
            const value = config.getValue('hello.nonExistant', 'defaultValue');
            expect(value).toBe('defaultValue');
        });

        it('must not return default value for falsy values', () => {
            const value = config.getValue('hello.isFalse', 'defaultValue');
            expect(value).toBe(false);
        });
    });

    describe('setValue', () => {
        it('must set value as immutable', () => {
            const testConfig = config.setValue('hello', {
                'cool': 1
            });
            const value = testConfig.getValue('hello');

            expect(Immutable.Map.isMap(value)).toBeTruthy();
            expect(value.size).toBe(1);
            expect(value.has('cool')).toBeTruthy();
        });

        it('must set deep value', () => {
            const testConfig = config.setValue('hello.world', 2);
            const hello = testConfig.getValue('hello');
            const world = testConfig.getValue('hello.world');

            expect(Immutable.Map.isMap(hello)).toBeTruthy();
            expect(hello.size).toBe(3);

            expect(world).toBe(2);
        });
    });

    describe('toReducedVersion', () => {
        it('must only return diffs for simple values', () => {
            const _config = Config.createWithValues({
                gitbook: '3.0.0'
            });

            const reducedVersion = _config.toReducedVersion();

            expect(reducedVersion.toJS()).toEqual({
                gitbook: '3.0.0'
            });
        });

        it('must only return diffs for deep values', () => {
            const _config = Config.createWithValues({
                structure: {
                    readme: 'intro.md'
                }
            });

            const reducedVersion = _config.toReducedVersion();

            expect(reducedVersion.toJS()).toEqual({
                structure: {
                    readme: 'intro.md'
                }
            });
        });
    });
});

