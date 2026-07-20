import { describe, expect, it } from 'bun:test';

import {
    MAX_API_TOKEN_COOKIE_LENGTH,
    getAPITokenFromCookies,
    getAPITokenResponseCookies,
} from './api-token-cookie';

const cookieName = 'gitbook-api-token~test';
const options = {
    httpOnly: true,
    sameSite: 'none' as const,
    secure: true,
    maxAge: 60 * 60,
};

describe('API token cookies', () => {
    it('keeps tokens at the cookie limit in one cookie', () => {
        const apiToken = 'a'.repeat(4_000);

        expect(getAPITokenResponseCookies({ cookies: [], cookieName, apiToken, options })).toEqual([
            { name: cookieName, value: apiToken, options },
        ]);
    });

    it('splits and reconstructs oversized tokens', () => {
        const apiToken = `${'a'.repeat(4_000)}b`;
        const cookies = getAPITokenResponseCookies({ cookies: [], cookieName, apiToken, options });

        expect(cookies).toEqual([
            { name: cookieName, value: '2', options },
            { name: `${cookieName}-0`, value: 'a'.repeat(4_000), options },
            { name: `${cookieName}-1`, value: 'b', options },
        ]);
        expect(getAPITokenFromCookies(cookies, cookieName)).toBe(apiToken);
    });

    it('rejects tokens that would exceed the response cookie header limit', () => {
        expect(() =>
            getAPITokenResponseCookies({
                cookies: [],
                cookieName,
                apiToken: 'a'.repeat(MAX_API_TOKEN_COOKIE_LENGTH + 1),
                options,
            })
        ).toThrow(`API token exceeds the ${MAX_API_TOKEN_COOKIE_LENGTH}-character cookie limit`);
    });

    it('reads legacy single-cookie tokens', () => {
        expect(
            getAPITokenFromCookies([{ name: cookieName, value: 'legacy-token' }], cookieName)
        ).toBe('legacy-token');
    });

    it('does not return a partial token when a chunk is missing', () => {
        expect(
            getAPITokenFromCookies(
                [
                    { name: cookieName, value: '2' },
                    { name: `${cookieName}-0`, value: 'first' },
                ],
                cookieName
            )
        ).toBeUndefined();
    });

    it('does not return a token when the first chunk is missing', () => {
        expect(
            getAPITokenFromCookies(
                [
                    { name: cookieName, value: '2' },
                    { name: `${cookieName}-1`, value: 'second' },
                ],
                cookieName
            )
        ).toBeUndefined();
    });

    it('treats malformed chunk counts as legacy token values', () => {
        expect(getAPITokenFromCookies([{ name: cookieName, value: '02' }], cookieName)).toBe('02');
    });

    it('expires chunks no longer needed by a replacement token', () => {
        const oldCookies = [
            { name: cookieName, value: '3' },
            { name: `${cookieName}-0`, value: 'first' },
            { name: `${cookieName}-1`, value: 'second' },
            { name: `${cookieName}-2`, value: 'third' },
        ];

        expect(
            getAPITokenResponseCookies({
                cookies: oldCookies,
                cookieName,
                apiToken: 'replacement',
                options,
            })
        ).toEqual([
            { name: cookieName, value: 'replacement', options },
            { name: `${cookieName}-0`, value: '', options: { ...options, maxAge: 0 } },
            { name: `${cookieName}-1`, value: '', options: { ...options, maxAge: 0 } },
            { name: `${cookieName}-2`, value: '', options: { ...options, maxAge: 0 } },
        ]);
    });

    it('does not attempt to expire an unbounded number of forged chunks', () => {
        expect(
            getAPITokenResponseCookies({
                cookies: [{ name: cookieName, value: '999999999' }],
                cookieName,
                apiToken: 'replacement',
                options,
            })
        ).toEqual([{ name: cookieName, value: 'replacement', options }]);
    });
});
