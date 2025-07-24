import { describe, expect, it } from 'bun:test';
import { getProxyRequestIdentifier, isProxyRequest, isProxyRootRequest } from './proxy';

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

describe('isProxyRootRequest', () => {
    it('should return true for root proxy requests', () => {
        const rootProxyRequestURL = new URL('https://proxy.gitbook.site/');
        expect(isProxyRootRequest(rootProxyRequestURL)).toBe(true);
    });

    it('should return true for sites root proxy requests', () => {
        const sitesRootProxyRequestURL = new URL('https://proxy.gitbook.site/sites');
        expect(isProxyRootRequest(sitesRootProxyRequestURL)).toBe(true);
    });

    it('should return true for sites root proxy requests with trailing slash', () => {
        const sitesRootProxyRequestURL = new URL('https://proxy.gitbook.site/sites/');
        expect(isProxyRootRequest(sitesRootProxyRequestURL)).toBe(true);
    });

    it('should return false for non proxy requests', () => {
        const nonRootProxyRequestURL = new URL('https://example.com/docs/foo/hello/world');
        expect(isProxyRootRequest(nonRootProxyRequestURL)).toBe(false);
    });

    it('should return false for non-root proxy requests', () => {
        const nonRootProxyRequestURL = new URL(
            'https://proxy.gitbook.site/sites/site_foo/hello/world'
        );
        expect(isProxyRootRequest(nonRootProxyRequestURL)).toBe(false);
    });
});
