var Immutable = require('immutable');
var Config = require('../config');

describe('Config', function() {
    var config = Config.createWithValues({
        hello: {
            world: 1,
            test: 'Hello',
            isFalse: false
        }
    });

    describe('getValue', function() {
        it('must return value as immutable', function() {
            var value = config.getValue('hello');
            expect(Immutable.Map.isMap(value)).toBeTruthy();
        });

        it('must return deep value', function() {
            var value = config.getValue('hello.world');
            expect(value).toBe(1);
        });

        it('must return default value if non existant', function() {
            var value = config.getValue('hello.nonExistant', 'defaultValue');
            expect(value).toBe('defaultValue');
        });

        it('must not return default value for falsy values', function() {
            var value = config.getValue('hello.isFalse', 'defaultValue');
            expect(value).toBe(false);
        });
    });

    describe('setValue', function() {
        it('must set value as immutable', function() {
            var testConfig = config.setValue('hello', {
                'cool': 1
            });
            var value = testConfig.getValue('hello');

            expect(Immutable.Map.isMap(value)).toBeTruthy();
            expect(value.size).toBe(1);
            expect(value.has('cool')).toBeTruthy();
        });

        it('must set deep value', function() {
            var testConfig = config.setValue('hello.world', 2);
            var hello = testConfig.getValue('hello');
            var world = testConfig.getValue('hello.world');

            expect(Immutable.Map.isMap(hello)).toBeTruthy();
            expect(hello.size).toBe(3);

            expect(world).toBe(2);
        });
    });

    describe('toReducedVersion', function() {
        it('must only return diffs for simple values', function() {
            var _config = Config.createWithValues({
                gitbook: '3.0.0'
            });

            var reducedVersion = _config.toReducedVersion();

            expect(reducedVersion.toJS()).toEqual({
                gitbook: '3.0.0'
            });
        });

        it('must only return diffs for deep values', function() {
            var _config = Config.createWithValues({
                structure: {
                    readme: 'intro.md'
                }
            });

            var reducedVersion = _config.toReducedVersion();

            expect(reducedVersion.toJS()).toEqual({
                structure: {
                    readme: 'intro.md'
                }
            });
        });
    });
});


