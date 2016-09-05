var path = require('path');

describe('Paths', function() {
    var PathUtils = require('..//path');

    describe('setExtension', function() {
        it('should correctly change extension of filename', function() {
            expect(PathUtils.setExtension('test.md', '.html')).toBe('test.html');
            expect(PathUtils.setExtension('test.md', '.json')).toBe('test.json');
        });

        it('should correctly change extension of path', function() {
            expect(PathUtils.setExtension('hello/test.md', '.html')).toBe(path.normalize('hello/test.html'));
            expect(PathUtils.setExtension('hello/test.md', '.json')).toBe(path.normalize('hello/test.json'));
        });
    });
});
