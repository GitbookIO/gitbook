import { describe, expect, it } from 'bun:test';
import { getProxyRequestIdentifier, isProxyRequest } from './proxy';

describe('isProxyRequest', () => {
    it('should return true for proxy requests', () => {
        const proxyRequestURL = new URL('https://proxy.gitbook.site/sites/site_foo/hello/world');
        expect(isProxyRequest(proxyRequestURL)).toBe(true);
    });

    it('should return false for non-proxy requests', () => {
        const nonProxyRequestURL = new URL('https://example.com/docs/foo/hello/world');
        expect(isProxyRequest(nonProxyRequestURL)).toBe(false);
    });
});

describe('getProxyRequestIdentifier', () => {
    it('should return the correct identifier for proxy requests', () => {
        const proxyRequestURL = new URL('https://proxy.gitbook.site/sites/site_foo/hello/world');
        expect(getProxyRequestIdentifier(proxyRequestURL)).toBe('sites/site_foo');
    });
});
