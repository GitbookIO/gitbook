import { describe, it, expect } from 'bun:test';

import { getURLLookupAlternatives } from './middleware';

describe('getURLLookupAlternatives', () => {
    it('should return all URLs up to the root', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/b/c'))).toEqual([
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
                extraPath: '',
                url: 'https://docs.mycompany.com/a/b/c',
                primary: true,
            },
        ]);
    });

    it('should not match before the variant for a variant url', () => {
        expect(
            getURLLookupAlternatives(new URL('https://test.gitbook.io/v/variant/space')),
        ).toEqual([
            {
                url: 'https://test.gitbook.io/v/variant',
                extraPath: 'space',
                primary: false,
            },
            {
                url: 'https://test.gitbook.io/v/variant/space',
                extraPath: '',
                primary: true,
            },
        ]);
    });

    it('should not match before a revision ID', () => {
        expect(
            getURLLookupAlternatives(new URL('https://docs.mycompany.com/~/revisions/id/hello')),
        ).toEqual([
            {
                extraPath: 'hello',
                url: 'https://docs.mycompany.com/~/revisions/id',
                primary: false,
            },
            {
                extraPath: '',
                url: 'https://docs.mycompany.com/~/revisions/id/hello',
                primary: true,
            },
        ]);
    });

    it('should not match before a revision ID', () => {
        expect(
            getURLLookupAlternatives(new URL('https://docs.mycompany.com/~/changes/id/hello')),
        ).toEqual([
            {
                extraPath: 'hello',
                url: 'https://docs.mycompany.com/~/changes/id',
                primary: false,
            },
            {
                extraPath: '',
                url: 'https://docs.mycompany.com/~/changes/id/hello',
                primary: true,
            },
        ]);
    });

    it('should normalize duplicated slashes', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com//hello'))).toEqual([
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
        ]);
    });

    it('should normalize trailing slash', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/hello/'))).toEqual([
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
        ]);
    });
});
