const path = require('path');

describe('Paths', () => {
    const PathUtils = require('..//path');

    describe('setExtension', () => {
        it('should correctly change extension of filename', () => {
            expect(PathUtils.setExtension('test.md', '.html')).toBe('test.html');
            expect(PathUtils.setExtension('test.md', '.json')).toBe('test.json');
        });

        it('should correctly change extension of path', () => {
            expect(PathUtils.setExtension('hello/test.md', '.html')).toBe(path.normalize('hello/test.html'));
            expect(PathUtils.setExtension('hello/test.md', '.json')).toBe(path.normalize('hello/test.json'));
        });
    });
});
