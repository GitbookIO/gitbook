jest.autoMockOff();

describe('LocationUtils', function() {
    var LocationUtils = require('../location');

    it('should correctly test external location', function() {
        expect(LocationUtils.isExternal('http://google.fr')).toBe(true);
        expect(LocationUtils.isExternal('https://google.fr')).toBe(true);
        expect(LocationUtils.isExternal('test.md')).toBe(false);
        expect(LocationUtils.isExternal('folder/test.md')).toBe(false);
        expect(LocationUtils.isExternal('/folder/test.md')).toBe(false);
        expect(LocationUtils.isExternal('data:image/png')).toBe(false);
    });

    it('should correctly test data:uri location', function() {
        expect(LocationUtils.isDataURI('data:image/png')).toBe(true);
        expect(LocationUtils.isDataURI('http://google.fr')).toBe(false);
        expect(LocationUtils.isDataURI('https://google.fr')).toBe(false);
        expect(LocationUtils.isDataURI('test.md')).toBe(false);
        expect(LocationUtils.isDataURI('data.md')).toBe(false);
    });

    it('should correctly validate git urls', function() {
        // HTTPS
        expect(LocationUtils.isGitUrl('git+https://github.com/Hello/world.git')).toBeTruthy();

        // SSH
        expect(LocationUtils.isGitUrl('git+git@github.com:GitbookIO/gitbook.git/directory/README.md#e1594cde2c32e4ff48f6c4eff3d3d461743d74e1')).toBeTruthy();

        // Non valid
        expect(LocationUtils.isGitUrl('https://github.com/Hello/world.git')).not.toBeTruthy();
        expect(LocationUtils.isGitUrl('README.md')).not.toBeTruthy();
    });

    it('should correctly detect anchor location', function() {
        expect(LocationUtils.isAnchor('#test')).toBe(true);
        expect(LocationUtils.isAnchor(' #test')).toBe(true);
        expect(LocationUtils.isAnchor('https://google.fr#test')).toBe(false);
        expect(LocationUtils.isAnchor('test.md#test')).toBe(false);
    });

    describe('.relative', function() {
        it('should resolve to a relative path (same folder)', function() {
            expect(LocationUtils.relative('links/', 'links/test.md')).toBe('test.md');
        });

        it('should resolve to a relative path (parent folder)', function() {
            expect(LocationUtils.relative('links/', 'test.md')).toBe('../test.md');
        });

        it('should resolve to a relative path (child folder)', function() {
            expect(LocationUtils.relative('links/', 'links/hello/test.md')).toBe('hello/test.md');
        });
    });

    describe('.toAbsolute', function() {
        it('should correctly transform as absolute', function() {
            expect(LocationUtils.toAbsolute('http://google.fr')).toBe('http://google.fr');
            expect(LocationUtils.toAbsolute('test.md', './', './')).toBe('test.md');
            expect(LocationUtils.toAbsolute('folder/test.md', './', './')).toBe('folder/test.md');
        });

        it('should correctly handle windows path', function() {
            expect(LocationUtils.toAbsolute('folder\\test.md', './', './')).toBe('folder/test.md');
        });

        it('should correctly handle absolute path', function() {
            expect(LocationUtils.toAbsolute('/test.md', './', './')).toBe('test.md');
            expect(LocationUtils.toAbsolute('/test.md', 'test', 'test')).toBe('../test.md');
            expect(LocationUtils.toAbsolute('/sub/test.md', 'test', 'test')).toBe('../sub/test.md');
            expect(LocationUtils.toAbsolute('/test.png', 'folder', '')).toBe('test.png');
        });

        it('should correctly handle absolute path (windows)', function() {
            expect(LocationUtils.toAbsolute('\\test.png', 'folder', '')).toBe('test.png');
        });

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


