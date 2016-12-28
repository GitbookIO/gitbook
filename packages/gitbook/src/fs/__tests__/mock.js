const createMockFS = require('../mock');

describe('MockFS', () => {
    const fs = createMockFS({
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

    describe('exists', () => {
        it('must return true for a file', () => {
            return fs.exists('README.md')
            .then((result) => {
                expect(result).toBeTruthy();
            });
        });

        it('must return false for a non existing file', () => {
            return fs.exists('README_NOTEXISTS.md')
            .then((result) => {
                expect(result).toBeFalsy();
            });
        });

        it('must return true for a directory', () => {
            return fs.exists('folder')
            .then((result) => {
                expect(result).toBeTruthy();
            });
        });

        it('must return true for a deep file', () => {
            return fs.exists('folder/test.md')
            .then((result) => {
                expect(result).toBeTruthy();
            });
        });

        it('must return true for a deep file (2)', () => {
            return fs.exists('folder/folder2/hello.md')
            .then((result) => {
                expect(result).toBeTruthy();
            });
        });
    });

    describe('readAsString', () => {
        it('must return content for a file', () => {
            return fs.readAsString('README.md')
            .then((result) => {
                expect(result).toBe('Hello World');
            });
        });

        it('must return content for a deep file', () => {
            return fs.readAsString('folder/test.md')
            .then((result) => {
                expect(result).toBe('Cool');
            });
        });
    });

    describe('readDir', () => {
        it('must return content for a directory', () => {
            return fs.readDir('./')
            .then((files) => {
                expect(files.size).toBe(3);
                expect(files.includes('README.md')).toBeTruthy();
                expect(files.includes('SUMMARY.md')).toBeTruthy();
                expect(files.includes('folder/')).toBeTruthy();
            });
        });
    });
});

