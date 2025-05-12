import { describe, expect, it } from 'bun:test';
import { getExtension } from './paths';

describe('getExtension', () => {
    it('should return the extension of a path', () => {
        expect(getExtension('test.txt')).toBe('.txt');
    });

    it('should return an empty string if there is no extension', () => {
        expect(getExtension('test/path/to/file')).toBe('');
    });

    it('should return the extension of a path with multiple dots', () => {
        expect(getExtension('test.with.multiple.dots.txt')).toBe('.txt');
    });
});
