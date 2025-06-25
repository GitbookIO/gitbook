import { describe, expect, it } from 'bun:test';
import { getImageResizingContextId } from './getImageResizingContextId';

describe('getImageResizingContextId', () => {
    it('should return proxy identifier for proxy requests', () => {
        const proxyRequestURL = new URL('https://proxy.gitbook.site/sites/site_foo/hello/world');
        expect(getImageResizingContextId(proxyRequestURL)).toBe('sites/site_foo');
    });

    it('should return preview identifier for preview requests', () => {
        const previewRequestURL = new URL('https://preview/site_foo/hello/world');
        expect(getImageResizingContextId(previewRequestURL)).toBe('site_foo');
    });

    it('should return host for regular requests', () => {
        const regularRequestURL = new URL('https://example.com/docs/foo/hello/world');
        expect(getImageResizingContextId(regularRequestURL)).toBe('example.com');
    });
});
