import { describe, expect, it } from 'bun:test';

import { getURLLookupAlternatives, normalizeURL, decodeURLPath } from './urls';

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
});

describe('decodeURLPath', () => {
    it('should decode encoded path components', () => {
        const url = new URL('https://docs.mycompany.com/helloworld/tes%74');
        const result = decodeURLPath(url);
        expect(result.pathname).toBe('/helloworld/test');
        expect(result.toString()).toBe('https://docs.mycompany.com/helloworld/test');
    });

    it('should handle multiple levels of encoding', () => {
        // Double encoded: %2574 = %74 (letter t)
        const url = new URL('https://docs.mycompany.com/helloworld/tes%74');
        const result = decodeURLPath(url);
        expect(result.pathname).toBe('/helloworld/test');
        
        // Triple encoded: %252574 = %2574 = %74 (letter t)
        const url2 = new URL('https://docs.mycompany.com/helloworld/tes%74');
        const result2 = decodeURLPath(url2);
        expect(result2.pathname).toBe('/helloworld/test');
    });

    it('should throw an error for invalid characters in the path', () => {
        expect(() => {
            decodeURLPath(new URL('https://docs.mycompany.com/hello:world'));
        }).toThrow('URL path contains invalid characters');
        
        expect(() => {
            decodeURLPath(new URL('https://docs.mycompany.com/hello%3Btest'));
        }).toThrow('URL path contains invalid characters');
        
        expect(() => {
            decodeURLPath(new URL('https://docs.mycompany.com/hello%40anchor'));
        }).toThrow('URL path contains invalid characters');

        //TODO: should we also throw for spaces? Maybe make an exception for spaces only?
        expect(() => {
            decodeURLPath(new URL('https://docs.mycompany.com/hello%20world'));
        }).toThrow();
    });

    it('should limit decoding iterations for nested % encodings to prevent DoS', () => {
        // 4 levels of encoding should throw an error
        // %25252525 = %252525 = %2525 = %25 = %
        const url = new URL('https://docs.mycompany.com/%25252525');
        expect(() => {
            decodeURLPath(url);
        }).toThrow('URL path is malformed');

        const deepUrl = new URL('https://docs.mycompany.com/%2525252525252525');
        expect(() => {
            decodeURLPath(deepUrl);
        }).toThrow('URL path is malformed');
    });

    // TODO: should we do that actually?
    it('should throw an error if the encoded path contains /', () => {
        expect(() => {
            decodeURLPath(new URL('https://docs.mycompany.com/hello%2Fworld'));
        }).toThrow('URL path contains invalid characters');
    });

    it('should not decode search params or hash fragments', () => {
        const url = new URL('https://docs.mycompany.com/helloworld/tes%74?query=%74est#sec%74ion');
        const result = decodeURLPath(url);
        expect(result.pathname).toBe('/helloworld/test');
        expect(result.search).toBe('?query=%74est');
        expect(result.hash).toBe('#sec%74ion');
    });
})