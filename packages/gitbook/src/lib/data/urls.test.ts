import { describe, expect, it } from 'bun:test';

import { getURLLookupAlternatives, normalizeURL } from './urls';

describe('getURLLookupAlternatives', () => {
    it('should return all URLs up to the root', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/b/c'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'a/b/c',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: 'b/c',
                    url: 'https://docs.mycompany.com/a',
                    primary: false,
                },
                {
                    extraPath: 'c',
                    url: 'https://docs.mycompany.com/a/b',
                    primary: false,
                },
                {
                    extraPath: '',
                    url: 'https://docs.mycompany.com/a/b/c',
                    primary: true,
                },
            ],
        });

        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/b/c/d'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'a/b/c/d',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: 'b/c/d',
                    url: 'https://docs.mycompany.com/a',
                    primary: false,
                },
                {
                    extraPath: 'c/d',
                    url: 'https://docs.mycompany.com/a/b',
                    primary: false,
                },
                {
                    extraPath: 'd',
                    url: 'https://docs.mycompany.com/a/b/c',
                    primary: false,
                },
                {
                    extraPath: '',
                    url: 'https://docs.mycompany.com/a/b/c/d',
                    primary: true,
                },
            ],
        });
    });

    it('should not match before the variant for a variant url', () => {
        expect(
            getURLLookupAlternatives(new URL('https://test.gitbook.io/v/variant/space'))
        ).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://test.gitbook.io/v/variant',
                    extraPath: 'space',
                    primary: true,
                },
            ],
        });
    });

    it('should not match before the variant for a variant in a share link', () => {
        expect(
            getURLLookupAlternatives(new URL('https://test.gitbook.io/sharelink/v/variant/space'))
        ).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://test.gitbook.io/sharelink/v/variant',
                    extraPath: 'space',
                    primary: true,
                },
            ],
        });
    });

    it('should not match before a revision in a variant', () => {
        expect(
            getURLLookupAlternatives(
                new URL('https://test.gitbook.io/v/variant/~/revisions/id/rest')
            )
        ).toEqual({
            revision: 'id',
            changeRequest: undefined,
            basePath: '~/revisions/id',
            urls: [
                {
                    url: 'https://test.gitbook.io/v/variant',
                    extraPath: 'rest',
                    primary: true,
                },
            ],
        });
    });

    it('should not match before a revision ID', () => {
        expect(
            getURLLookupAlternatives(new URL('https://docs.mycompany.com/~/revisions/id/a/b/c'))
        ).toEqual({
            revision: 'id',
            changeRequest: undefined,
            basePath: '~/revisions/id',
            urls: [
                {
                    extraPath: 'a/b/c',
                    url: 'https://docs.mycompany.com/',
                    primary: true,
                },
            ],
        });
    });

    it('should not match before a change request ID', () => {
        expect(
            getURLLookupAlternatives(new URL('https://docs.mycompany.com/~/changes/id/hello'))
        ).toEqual({
            revision: undefined,
            changeRequest: 'id',
            basePath: '~/changes/id',
            urls: [
                {
                    extraPath: 'hello',
                    url: 'https://docs.mycompany.com/',
                    primary: true,
                },
            ],
        });
    });

    it('should normalize duplicated slashes', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com//hello'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'hello',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: '',
                    url: 'https://docs.mycompany.com/hello',
                    primary: true,
                },
            ],
        });
    });

    it('should normalize trailing slash', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/hello/'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'hello',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: '',
                    url: 'https://docs.mycompany.com/hello',
                    primary: true,
                },
            ],
        });
    });

    it('should match a variant in a share-link', () => {
        expect(
            getURLLookupAlternatives(new URL('https://test.gitbook.io/sharelink/v/variant/space'))
        ).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://test.gitbook.io/sharelink/v/variant',
                    extraPath: 'space',
                    primary: true,
                },
            ],
        });
    });

    it('should match a revision in a variant in a share-link', () => {
        expect(
            getURLLookupAlternatives(
                new URL('https://test.gitbook.io/sharelink/v/variant/~/revisions/id/a/b/c')
            )
        ).toEqual({
            revision: 'id',
            changeRequest: undefined,
            basePath: '~/revisions/id',
            urls: [
                {
                    url: 'https://test.gitbook.io/sharelink/v/variant',
                    extraPath: 'a/b/c',
                    primary: true,
                },
            ],
        });
    });

    it('should match a change request in a variant in a share-link', () => {
        expect(
            getURLLookupAlternatives(
                new URL('https://test.gitbook.io/sharelink/v/variant/~/changes/id/a/b/c')
            )
        ).toEqual({
            revision: undefined,
            changeRequest: 'id',
            basePath: '~/changes/id',
            urls: [
                {
                    url: 'https://test.gitbook.io/sharelink/v/variant',
                    extraPath: 'a/b/c',
                    primary: true,
                },
            ],
        });
    });

    it('should limit depth', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/b/c/d/e'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'a/b/c/d/e',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: 'b/c/d/e',
                    url: 'https://docs.mycompany.com/a',
                    primary: false,
                },
                {
                    extraPath: 'c/d/e',
                    url: 'https://docs.mycompany.com/a/b',
                    primary: false,
                },
                {
                    extraPath: 'd/e',
                    url: 'https://docs.mycompany.com/a/b/c',
                    primary: false,
                },
                {
                    extraPath: 'e',
                    url: 'https://docs.mycompany.com/a/b/c/d',
                    primary: true,
                },
            ],
        });
    });

    it('should ignore dummy ~', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/~/b/c/d'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    extraPath: 'a/~/b/c/d',
                    url: 'https://docs.mycompany.com/',
                    primary: false,
                },
                {
                    extraPath: '~/b/c/d',
                    url: 'https://docs.mycompany.com/a',
                    primary: false,
                },
                {
                    extraPath: 'b/c/d',
                    url: 'https://docs.mycompany.com/a/~',
                    primary: false,
                },
                {
                    extraPath: 'c/d',
                    url: 'https://docs.mycompany.com/a/~/b',
                    primary: false,
                },
                {
                    extraPath: 'd',
                    primary: true,
                    url: 'https://docs.mycompany.com/a/~/b/c',
                },
            ],
        });
    });

    it('should match a root gitbook.io domain', () => {
        expect(getURLLookupAlternatives(new URL('https://test.gitbook.io/'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://test.gitbook.io/',
                    extraPath: '',
                    primary: true,
                },
            ],
        });
    });

    it('should skip root gitbook.io domain if a path is present', () => {
        expect(getURLLookupAlternatives(new URL('https://test.gitbook.io/space'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://test.gitbook.io/space',
                    extraPath: '',
                    primary: true,
                },
            ],
        });
    });

    it('should match a root custom domain', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/'))).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://docs.mycompany.com/',
                    extraPath: '',
                    primary: true,
                },
            ],
        });
    });

    it('should skip proxy root URLs', () => {
        expect(
            getURLLookupAlternatives(
                new URL('https://proxy.gitbook.site/sites/site_foo/hello/world')
            )
        ).toEqual({
            revision: undefined,
            changeRequest: undefined,
            basePath: undefined,
            urls: [
                {
                    url: 'https://proxy.gitbook.site/sites/site_foo',
                    extraPath: 'hello/world',
                    primary: false,
                },
                {
                    url: 'https://proxy.gitbook.site/sites/site_foo/hello',
                    extraPath: 'world',
                    primary: false,
                },
                {
                    url: 'https://proxy.gitbook.site/sites/site_foo/hello/world',
                    extraPath: '',
                    primary: true,
                },
            ],
        });
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
