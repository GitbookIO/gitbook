import { describe, expect, it } from 'bun:test';
import {
    getProxyRequestIdentifier,
    isProxyRequest,
    isProxyRootRequest,
    resolveForwardedHost,
} from './proxy';

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

describe('resolveForwardedHost', () => {
    it('keeps the proxy host when a proxied request forwards a customer x-forwarded-host', () => {
        // A customer's Vercel rewrite to proxy.gitbook.site/sites/<id> forwards its own
        // x-forwarded-host; using it would glue the customer host onto the /sites/<id> path
        // and resolve to a "Domain not found".
        expect(
            resolveForwardedHost({ host: 'proxy.gitbook.site', forwardedHost: 'argos-ci.com' })
        ).toBe('proxy.gitbook.site');
        expect(
            resolveForwardedHost({
                host: 'proxy.gitbook-staging.site',
                forwardedHost: 'argos-ci.com',
            })
        ).toBe('proxy.gitbook-staging.site');
    });

    it('uses the forwarded host for regular custom-hostname requests', () => {
        expect(
            resolveForwardedHost({ host: 'docs.company.com', forwardedHost: 'docs.company.com' })
        ).toBe('docs.company.com');
    });

    it('falls back to the forwarded host when the request host is missing', () => {
        expect(resolveForwardedHost({ host: null, forwardedHost: 'argos-ci.com' })).toBe(
            'argos-ci.com'
        );
    });
});
