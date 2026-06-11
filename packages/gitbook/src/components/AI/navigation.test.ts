import { describe, expect, it } from 'bun:test';
import { normalizePathname, resolveNavigationTarget } from './navigation';

const location = {
    href: 'https://docs.example.com/guides/intro',
    origin: 'https://docs.example.com',
};

describe('resolveNavigationTarget', () => {
    it('resolves an absolute same-origin URL to a relative href and pathname', () => {
        expect(
            resolveNavigationTarget('https://docs.example.com/reference/models', location)
        ).toEqual({ href: '/reference/models', pathname: '/reference/models' });
    });

    it('keeps the query string and section anchor in href but not in pathname', () => {
        expect(
            resolveNavigationTarget(
                'https://docs.example.com/reference/models?tab=api#usage',
                location
            )
        ).toEqual({ href: '/reference/models?tab=api#usage', pathname: '/reference/models' });
    });

    it('resolves a relative path against the current location', () => {
        expect(resolveNavigationTarget('/reference/models', location)).toEqual({
            href: '/reference/models',
            pathname: '/reference/models',
        });
    });

    it('rejects a URL pointing to an external site', () => {
        const result = resolveNavigationTarget('https://evil.example.org/phishing', location);
        expect('error' in result).toBe(true);
    });
});

describe('normalizePathname', () => {
    it('strips a trailing slash', () => {
        expect(normalizePathname('/guides/intro/')).toBe('/guides/intro');
    });

    it('keeps the root slash', () => {
        expect(normalizePathname('/')).toBe('/');
    });

    it('decodes percent-encoding so encoded and decoded paths compare equal', () => {
        expect(normalizePathname('/h%C3%A9llo')).toBe(normalizePathname('/héllo'));
    });

    it('treats encoded and decoded paths with a trailing slash as equal', () => {
        expect(normalizePathname('/caf%C3%A9/')).toBe(normalizePathname('/café'));
    });
});
