import { describe, it, expect } from 'bun:test';

import { getURLLookupAlternatives } from './middleware';

describe('getURLLookupAlternatives', () => {
    it('should return all URLs up to the root', () => {
        expect(getURLLookupAlternatives(new URL('https://docs.mycompany.com/a/b/c'))).toEqual([
            {
                extraPath: 'a/b/c',
                url: 'https://docs.mycompany.com/',
            },
            {
                extraPath: 'b/c',
                url: 'https://docs.mycompany.com/a',
            },
            {
                extraPath: '',
                url: 'https://docs.mycompany.com/a/b/c',
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
            },
            {
                url: 'https://test.gitbook.io/v/variant/space',
                extraPath: '',
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
            },
            {
                extraPath: '',
                url: 'https://docs.mycompany.com/~/revisions/id/hello',
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
            },
            {
                extraPath: '',
                url: 'https://docs.mycompany.com/~/changes/id/hello',
            },
        ]);
    });
});
