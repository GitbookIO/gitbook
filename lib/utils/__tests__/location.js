jest.autoMockOff();

describe('LocationUtils', function() {
    var LocationUtils = require('../location');

    describe('toAbsolute', function() {

        it('should resolve path starting by "/" in root directory', function() {
            expect(
                LocationUtils.toAbsolute('/test/hello.md', './', './')
            ).toBe('test/hello.md');
        });

        it('should resolve path starting by "/" in child directory', function() {
            expect(
                LocationUtils.toAbsolute('/test/hello.md', './hello', './')
            ).toBe('test/hello.md');
        });

        it('should resolve path starting by "/" in child directory, with same output directory', function() {
            expect(
                LocationUtils.toAbsolute('/test/hello.md', './hello', './hello')
            ).toBe('../test/hello.md');
        });
    });

});


