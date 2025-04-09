import { describe, expect, it } from 'bun:test';

import { getSiteCanonicalURL, getURLLookupAlternatives, normalizeURL } from './urls';

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
});

describe('getSiteCanonicalURL', () => {
    it('should have the jwt token in canonical url if token was from the source url', () => {
        expect(
            getSiteCanonicalURL(
                {
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
                },
                {
                    source: 'url',
                    token: 'jwt_foo',
                }
            ).toString()
        ).toEqual('https://example.com/docs/foo/hello/world?jwt_token=jwt_foo');
    });

    it('should not have the jwt token in canonical url if token was NOT from the source url', () => {
        // va cookie
        expect(
            getSiteCanonicalURL(
                {
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
                },
                {
                    source: 'visitor-auth-cookie',
                    basePath: '/foo/',
                    token: 'jwt_foo',
                }
            ).toString()
        ).toEqual('https://example.com/docs/foo/hello/world');

        // gitbook visitor cookie
        expect(
            getSiteCanonicalURL(
                {
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
                },
                {
                    source: 'gitbook-visitor-cookie',
                    token: 'jwt_foo',
                }
            ).toString()
        ).toEqual('https://example.com/docs/foo/hello/world');
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
