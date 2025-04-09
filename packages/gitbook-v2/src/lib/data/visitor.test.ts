import { describe, expect, it } from 'bun:test';
import { getVisitorAuthBasePath } from './visitor';

describe('getVisitorAuthBasePath', () => {
    it('should return the correct base path for proxy requests', () => {
        expect(
            getVisitorAuthBasePath(
                new URL('https://proxy.gitbook.site/sites/site_foo/hello/world'),
                {
                    site: 'site_foo',
                    siteSpace: 'sitesp_foo',
                    basePath: '/foo',
                    siteBasePath: '/foo',
                    organization: 'org_foo',
                    space: 'space_foo',
                    pathname: '/hello/world',
                    complete: false,
                    apiToken: 'api_token_foo',
                    canonicalUrl: 'https://example.com/docs/foo/hello/world',
                }
            )
        ).toBe('/sites/site_foo/');
    });

    it('should return the correct base path for non-proxy requests', () => {
        expect(
            getVisitorAuthBasePath(new URL('https://example.com/docs/foo/hello/world'), {
                site: 'site_foo',
                siteSpace: 'sitesp_foo',
                basePath: '/foo/',
                siteBasePath: '/foo/',
                organization: 'org_foo',
                space: 'space_foo',
                pathname: '/hello/world',
                complete: false,
                apiToken: 'api_token_foo',
                canonicalUrl: 'https://example.com/docs/foo/hello/world',
            })
        ).toBe('/foo/');
    });
});
