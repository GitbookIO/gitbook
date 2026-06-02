import { describe, expect, it } from 'bun:test';
import { getPreviewRequestIdentifier, isPreviewRequest } from './preview';

describe('isPreviewRequest', () => {
    it('should return true for preview requests', () => {
        const previewRequestURL = new URL('https://sites.gitbook.com/preview/site_foo/hello/world');
        expect(isPreviewRequest(previewRequestURL)).toBe(true);
    });

    it('should return false for non-preview requests', () => {
        const nonPreviewRequestURL1 = new URL('https://example.com/docs/foo/hello/world');
        expect(isPreviewRequest(nonPreviewRequestURL1)).toBe(false);

        const previewRequestURL2 = new URL('https://preview/site_foo/hello/world');
        expect(isPreviewRequest(previewRequestURL2)).toBe(false);
    });
});

describe('getPreviewRequestIdentifier', () => {
    it('should return the correct identifier for preview requests', () => {
        const previewRequestURL = new URL('https://sites.gitbook.com/preview/site_foo/hello/world');
        expect(getPreviewRequestIdentifier(previewRequestURL)).toBe('site_foo');
    });
});
