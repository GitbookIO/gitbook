const URIIndex = require('../uriIndex');

describe.only('URIIndex', () => {
    let index;

    before(() => {
        index = new URIIndex({
            'README.md':       'index.html',
            'world.md':        'world.html',
            'hello/README.md': 'hello/index.html',
            'hello/test.md':   'hello/test.html'
        });
    });

    describe('.resolve', () => {

        it('should resolve a basic file path', () => {
            expect(index.resolve('README.md')).toBe('index.html');
        });

        it('should resolve a nested file path', () => {
            expect(index.resolve('hello/test.md')).toBe('hello/test.html');
        });

        it('should normalize path', () => {
            expect(index.resolve('./hello//test.md')).toBe('hello/test.html');
        });

        it('should not fail for non existing entries', () => {
            expect(index.resolve('notfound.md')).toBe('notfound.md');
        });

        it('should not fail for absolute url', () => {
            expect(index.resolve('http://google.fr')).toBe('http://google.fr');
        });

        it('should preserve hash', () => {
            expect(index.resolve('hello/test.md#myhash')).toBe('hello/test.html#myhash');
        });

    });

    describe('.resolveFrom', () => {

        it('should resolve correctly in same directory', () => {
            expect(index.resolveFrom('README.md', 'world.md')).toBe('world.html');
        });

        it('should resolve correctly for a nested path', () => {
            expect(index.resolveFrom('README.md', 'hello/README.md')).toBe('hello/index.html');
        });

        it('should resolve correctly for a nested path (2)', () => {
            expect(index.resolveFrom('hello/README.md', 'test.md')).toBe('test.html');
        });

        it('should resolve correctly for a nested path (3)', () => {
            expect(index.resolveFrom('hello/README.md', '../README.md')).toBe('../index.html');
        });

        it('should preserve hash', () => {
            expect(index.resolveFrom('README.md', 'hello/README.md#myhash')).toBe('hello/index.html#myhash');
        });

        it('should not fail for absolute url', () => {
            expect(index.resolveFrom('README.md', 'http://google.fr')).toBe('http://google.fr');
        });

    });

});
