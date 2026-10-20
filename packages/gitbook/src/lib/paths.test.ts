import { describe, expect, it } from 'bun:test';

import { getExtension, isGitBookInternalPath } from './paths';

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

describe('isGitBookInternalPath', () => {
    it('should match paths with a ~gitbook segment', () => {
        expect(isGitBookInternalPath('/2024.4/~gitbook/pdf')).toBe(true);
        expect(isGitBookInternalPath('/docs/~gitbook')).toBe(true);
        expect(isGitBookInternalPath('~gitbook/pdf')).toBe(true);
    });

    it('should not match paths that only contain ~gitbook as part of a segment', () => {
        expect(isGitBookInternalPath('/docs/getting-started')).toBe(false);
        expect(isGitBookInternalPath('/docs/~gitbooks/pdf')).toBe(false);
        expect(isGitBookInternalPath('/docs/my~gitbook/pdf')).toBe(false);
    });
});
