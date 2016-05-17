var createMockFS = require('../mock');

describe('MockFS', function() {
    var fs = createMockFS({
        'README.md': 'Hello World',
        'SUMMARY.md': '# Summary',
        'folder': {
            'test.md': 'Cool',
            'folder2': {
                'hello.md': 'Hello',
                'world.md': 'World'
            }
        }
    });

    describe('exists', function() {
        it('must return true for a file', function() {
            return fs.exists('README.md')
            .then(function(result) {
                expect(result).toBeTruthy();
            });
        });

        it('must return false for a non existing file', function() {
            return fs.exists('README_NOTEXISTS.md')
            .then(function(result) {
                expect(result).toBeFalsy();
            });
        });

        it('must return true for a directory', function() {
            return fs.exists('folder')
            .then(function(result) {
                expect(result).toBeTruthy();
            });
        });

        it('must return true for a deep file', function() {
            return fs.exists('folder/test.md')
            .then(function(result) {
                expect(result).toBeTruthy();
            });
        });

        it('must return true for a deep file (2)', function() {
            return fs.exists('folder/folder2/hello.md')
            .then(function(result) {
                expect(result).toBeTruthy();
            });
        });
    });

    describe('readAsString', function() {
        it('must return content for a file', function() {
            return fs.readAsString('README.md')
            .then(function(result) {
                expect(result).toBe('Hello World');
            });
        });

        it('must return content for a deep file', function() {
            return fs.readAsString('folder/test.md')
            .then(function(result) {
                expect(result).toBe('Cool');
            });
        });
    });

    describe('readDir', function() {
        it('must return content for a directory', function() {
            return fs.readDir('./')
            .then(function(files) {
                expect(files.size).toBe(3);
                expect(files.includes('README.md')).toBeTruthy();
                expect(files.includes('SUMMARY.md')).toBeTruthy();
                expect(files.includes('folder/')).toBeTruthy();
            });
        });
    });
});


