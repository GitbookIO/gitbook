import { describe, expect, it } from 'bun:test';

import { getURLLookup, getURLLookupPathname, normalizeURL } from './urls';

describe('getURLLookupPathname', () => {
    const previewRoot = 'https://sites.gitbook.com/preview/site_example/section';
    const pagePath = 'guides/access/setup';
    const homepagePath = '/welcome/overview';

    it.each(['revisions', 'changes'])(
        'resolves a page in a %s preview from the site-space root',
        (kind) => {
            const lookup = getURLLookup(
                new URL(`${previewRoot}/~/${kind}/revision-id/${pagePath}`)
            )!;

            expect(
                getURLLookupPathname(lookup, {
                    basePath: '/preview/site_example/section/',
                    pathname: homepagePath,
                })
            ).toBe(`/${pagePath}`);
        }
    );

    it.each(['revisions', 'changes'])(
        'preserves the custom homepage at a %s preview root',
        (kind) => {
            const lookup = getURLLookup(new URL(`${previewRoot}/~/${kind}/revision-id/`))!;

            expect(
                getURLLookupPathname(lookup, {
                    basePath: '/preview/site_example/section/',
                    pathname: homepagePath,
                })
            ).toBe(`${homepagePath}/`);
        }
    );

    it('uses the resolved pathname for a full URL lookup', () => {
        const lookup = getURLLookup(new URL(`https://docs.example.com/section/${pagePath}`))!;

        expect(
            getURLLookupPathname(lookup, {
                basePath: '/section/',
                pathname: `/${pagePath}`,
            })
        ).toBe(`/${pagePath}/`);
    });

    it('preserves page resolution without a custom homepage', () => {
        const lookup = getURLLookup(new URL(`${previewRoot}/~/revisions/revision-id/${pagePath}`))!;

        expect(
            getURLLookupPathname(lookup, {
                basePath: '/preview/site_example/section/',
                pathname: '/',
            })
        ).toBe(`/${pagePath}`);
    });

    it.each(['/section/variant', '/section/variant/'])(
        'recognizes a root lookup with base path %s',
        (basePath) => {
            expect(
                getURLLookupPathname(
                    {
                        url: 'https://docs.example.com/section/variant/',
                        extraPath: 'guide/page',
                    },
                    { basePath, pathname: homepagePath }
                )
            ).toBe('/guide/page');
        }
    );

    it('preserves a legitimate page prefix for a non-root lookup', () => {
        expect(
            getURLLookupPathname(
                { url: 'https://docs.example.com/section/guide', extraPath: 'page' },
                { basePath: '/section/', pathname: '/guide' }
            )
        ).toBe('/guide/page');
    });
});

describe('getURLLookup', () => {
    it.each([
        'https://docs.mycompany.com/',
        'https://docs.mycompany.com/a/b/c/d/e',
        'https://test.gitbook.io/space',
        'https://test.gitbook.io/v/variant/space',
        'https://test.gitbook.io/sharelink/v/variant/space',
        'https://docs.mycompany.com/a/~/b/c/d',
        'https://docs.mycompany.com/section/variant/~gitbook/ogimage/pageId',
        'https://org.gitbook.io/~gitbook/icon',
        'https://docs.mycompany.com/llms-full.txt/100',
        'https://docs.mycompany.com/section/blog/rss.xml',
        'https://docs.mycompany.com/a/b/intro.md',
        'https://proxy.gitbook.site/sites/site_foo/hello/world',
    ])('looks up the full URL %s', (url) => {
        expect(getURLLookup(new URL(url))).toEqual({ url, extraPath: '' });
    });

    it('looks up the normalized URL', () => {
        expect(getURLLookup(new URL('https://docs.mycompany.com//hello/'))).toEqual({
            url: 'https://docs.mycompany.com/hello',
            extraPath: '',
        });
    });

    it('should not match before a revision ID', () => {
        expect(getURLLookup(new URL('https://docs.mycompany.com/~/revisions/id/a/b/c'))).toEqual({
            url: 'https://docs.mycompany.com/',
            extraPath: 'a/b/c',
            basePath: '~/revisions/id',
            revision: 'id',
        });
    });

    it('should not match before a change request ID', () => {
        expect(getURLLookup(new URL('https://docs.mycompany.com/~/changes/id/hello'))).toEqual({
            url: 'https://docs.mycompany.com/',
            extraPath: 'hello',
            basePath: '~/changes/id',
            changeRequest: 'id',
        });
    });

    it('should match a revision in a variant in a share-link', () => {
        expect(
            getURLLookup(
                new URL('https://test.gitbook.io/sharelink/v/variant/~/revisions/id/a/b/c')
            )
        ).toEqual({
            url: 'https://test.gitbook.io/sharelink/v/variant',
            extraPath: 'a/b/c',
            basePath: '~/revisions/id',
            revision: 'id',
        });
    });

    it('should keep the revision base path for an internal path', () => {
        expect(
            getURLLookup(
                new URL('https://docs.mycompany.com/~/revisions/id/a/~gitbook/ogimage/pageId')
            )
        ).toEqual({
            url: 'https://docs.mycompany.com/',
            extraPath: 'a/~gitbook/ogimage/pageId',
            basePath: '~/revisions/id',
            revision: 'id',
        });
    });

    it.each([
        'https://proxy.gitbook.site/',
        'https://proxy.gitbook.site/sites',
        'https://proxy.gitbook.site/sites/~/changes/id/hello',
    ])('should skip the proxy root URL %s', (url) => {
        expect(getURLLookup(new URL(url))).toBeNull();
    });
});

describe('normalizeURL', () => {
    it('should remove trailing slashes', () => {
        expect(normalizeURL(new URL('https://docs.mycompany.com/hello/'))).toEqual(
            new URL('https://docs.mycompany.com/hello')
        );
    });

    it('should remove duplicate slashes', () => {
        expect(normalizeURL(new URL('https://docs.mycompany.com//hello//there'))).toEqual(
            new URL('https://docs.mycompany.com/hello/there')
        );
    });

    it('should throw for URL paths exceeding 2048 characters', () => {
        const longPath = '/a'.repeat(1025); // 2050 chars
        const url = new URL(`https://docs.mycompany.com${longPath}`);
        expect(() => {
            normalizeURL(url);
        }).toThrow('URL path is too long');
    });
});

describe('normalizeURL with encoded paths', () => {
    it('should decode encoded path components', () => {
        const url = new URL('https://docs.mycompany.com/helloworld/tes%74');
        const result = normalizeURL(url);
        expect(result.pathname).toBe('/helloworld/test');
        expect(result.toString()).toBe('https://docs.mycompany.com/helloworld/test');
    });

    it('should handle multiple levels of encoding', () => {
        // Double encoded: tes%2574 → tes%74 → test
        // %2574 decodes as: %25 → %, leaving %74, which then decodes to t
        const url = new URL('https://docs.mycompany.com/helloworld/tes%2574');
        const result = normalizeURL(url);
        expect(result.pathname).toBe('/helloworld/test');

        // Triple encoding is also normalized through the nested normalizeURL flow.
        const tripleEncoded = normalizeURL(
            new URL('https://docs.mycompany.com/helloworld/tes%252574')
        );
        expect(tripleEncoded.pathname).toBe('/helloworld/test');
    });

    it('should throw for malformed percent-encoding in the path', () => {
        // Invalid hex digits in percent-encoding
        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/helloworld/%ZZ'));
        }).toThrow('URL path is malformed');

        // Incomplete or invalid UTF-8 sequence
        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/helloworld/%E0%A4%A'));
        }).toThrow('URL path is malformed');

        // Trailing '%' without two following hex digits
        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/helloworld/trailing%'));
        }).toThrow('URL path is malformed');
    });

    it.skip('should throw an error for invalid characters in the path', () => {
        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/hello:world'));
        }).toThrow('URL path contains invalid characters');

        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/hello%3Btest'));
        }).toThrow('URL path contains invalid characters');

        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/hello%40anchor'));
        }).toThrow('URL path contains invalid characters');

        // %20 (space) re-encodes to %20 after decoding, so the path is stable
        // and considered fully decoded — it should not throw.
        expect(normalizeURL(new URL('https://docs.mycompany.com/hello%20world')).pathname).toBe(
            '/hello%20world'
        );
    });

    it('should limit decoding iterations for nested % encodings to prevent DoS', () => {
        // 3+ levels of encoding exceed the 2-pass limit and should throw.
        // %25252525 needs 4 passes: %25252525 → %252525 → %2525 → %25 → %
        const url = new URL('https://docs.mycompany.com/%25252525');
        expect(() => {
            normalizeURL(url);
        }).toThrow('URL path is malformed');

        const deepUrl = new URL('https://docs.mycompany.com/%2525252525252525');
        expect(() => {
            normalizeURL(deepUrl);
        }).toThrow('URL path is malformed');
    });

    // TODO: should we do that actually?
    it.skip('should throw an error if the encoded path contains /', () => {
        expect(() => {
            normalizeURL(new URL('https://docs.mycompany.com/hello%2Fworld'));
        }).toThrow('URL path contains invalid characters');
    });

    it('should not decode search params or hash fragments', () => {
        const url = new URL('https://docs.mycompany.com/helloworld/tes%74?query=%74est#sec%74ion');
        const result = normalizeURL(url);
        expect(result.pathname).toBe('/helloworld/test');
        expect(result.search).toBe('?query=%74est');
        expect(result.hash).toBe('#sec%74ion');
    });

    it('should not apply the path length limit to a jwt_token query param', () => {
        // A massive fake JWT token (header.payload.signature, all base64url)
        const fakeJwt = `${'a'.repeat(500)}.${'b'.repeat(500)}.${'c'.repeat(500)}`;
        const url = new URL(`https://docs.mycompany.com/short-path?jwt_token=${fakeJwt}`);
        // The path itself is well within the limit; only the query param is huge.
        expect(url.pathname.length).toBeLessThan(2048);
        const result = normalizeURL(url);
        expect(result.pathname).toBe('/short-path');
        // The query string must pass through untouched.
        expect(result.searchParams.get('jwt_token')).toBe(fakeJwt);
    });

    it('should not affect rison-encoded query params', () => {
        // Rison uses characters such as '(', ')', '!', "'" and ':' that are
        // valid inside query strings but would be rejected if found in the path.
        const risonValue = "(id:!(1,2,3),name:'hello world',flag:!t)";
        const url = new URL(
            `https://docs.mycompany.com/some-page?filter=${encodeURIComponent(risonValue)}`
        );
        const result = normalizeURL(url);
        expect(result.pathname).toBe('/some-page');
        // The rison param must survive normalizeURL intact.
        expect(result.searchParams.get('filter')).toBe(risonValue);
    });
});
