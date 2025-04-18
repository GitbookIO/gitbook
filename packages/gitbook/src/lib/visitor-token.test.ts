import { describe, expect, it } from 'bun:test';

import type { JwtPayload } from 'jwt-decode';
import {
    getVisitorAuthCookieMaxAge,
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
    getVisitorToken,
} from './visitor-token';

describe('getVisitorAuthToken', () => {
    it('should return the token from the query parameters', () => {
        expect(
            getVisitorToken({ cookies: [], url: new URL('https://example.com?jwt_token=123') })
        ).toEqual({ source: 'url', token: '123' });
    });

    it('should return the token from the cookie root basepath', () => {
        const visitorAuth = getVisitorToken({
            cookies: [
                {
                    name: getVisitorAuthCookieName('/'),
                    value: getVisitorAuthCookieValue('/', '123'),
                },
            ],
            url: new URL('https://example.com'),
        });
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return the token from the cookie root basepath for a sub-path', () => {
        const visitorAuth = getVisitorToken({
            cookies: [
                {
                    name: getVisitorAuthCookieName('/'),
                    value: getVisitorAuthCookieValue('/', '123'),
                },
            ],
            url: new URL('https://example.com/hello/world'),
        });
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });
    it('should return the closest token from the path', () => {
        const visitorAuth = getVisitorToken({
            cookies: [
                {
                    name: getVisitorAuthCookieName('/'),
                    value: getVisitorAuthCookieValue('/', 'no'),
                },
                {
                    name: getVisitorAuthCookieName('/hello/'),
                    value: getVisitorAuthCookieValue('/hello/', '123'),
                },
            ],
            url: new URL('https://example.com/hello/world'),
        });
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return the token from the cookie in a collection type url', () => {
        const visitorAuth = getVisitorToken({
            cookies: [
                {
                    name: getVisitorAuthCookieName('/hello/v/space1/'),
                    value: getVisitorAuthCookieValue('/hello/v/space1/', '123'),
                },
            ],
            url: new URL('https://example.com/hello/v/space1/cool'),
        });
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return undefined if no cookie and no query param', () => {
        expect(
            getVisitorToken({
                cookies: [],
                url: new URL('https://example.com'),
            })
        ).toBeUndefined();
    });

    // For backwards compatibility
    it('should return the token from the cookie of a /v/ path when the url does not have /v/', () => {
        const visitorAuth = getVisitorToken({
            cookies: [
                {
                    name: getVisitorAuthCookieName('/'),
                    value: getVisitorAuthCookieValue('/', 'no'),
                },
                {
                    name: getVisitorAuthCookieName('/hello/v/space1/'),
                    value: getVisitorAuthCookieValue('/hello/v/space1/', 'gotcha'),
                },
            ],
            url: new URL('https://example.com/hello/space1/cool'),
        });
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('gotcha');
    });
});

describe('getVisitorAuthCookieMaxAge', () => {
    const ONE_MINUTE_IN_SECONDS = 60;

    it('returns the max age of 7 days if token expires in 7 days', () => {
        const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);
        const decoded: JwtPayload = { exp: now + SEVEN_DAYS_IN_SECONDS };

        expect(getVisitorAuthCookieMaxAge(decoded)).toBe(SEVEN_DAYS_IN_SECONDS);
    });

    it('returns the max age of 30 days if token expires in 30 days', () => {
        const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);
        const decoded: JwtPayload = { exp: now + THIRTY_DAYS_IN_SECONDS };

        expect(getVisitorAuthCookieMaxAge(decoded)).toBe(THIRTY_DAYS_IN_SECONDS);
    });

    it('returns the minimum max age of 60 seconds if token has already expired', () => {
        const now = Math.floor(Date.now() / 1000);
        const decoded: JwtPayload = { exp: now - 1000 };

        expect(getVisitorAuthCookieMaxAge(decoded)).toBe(ONE_MINUTE_IN_SECONDS);
    });

    it('returns the minimum max age of 60 seconds if token expires in less than 60 seconds', () => {
        const now = Math.floor(Date.now() / 1000);
        const decoded: JwtPayload = { exp: now + 30 }; // Expires in 30 seconds

        expect(getVisitorAuthCookieMaxAge(decoded)).toBe(ONE_MINUTE_IN_SECONDS);
    });

    it('returns the correct value if expiry is in the future but more than 60 seconds', () => {
        const now = Math.floor(Date.now() / 1000);
        const decoded: JwtPayload = { exp: now + 300 }; // Expires in 5 minutes

        expect(getVisitorAuthCookieMaxAge(decoded)).toBe(300);
    });
});

function assertVisitorAuthCookieValue(
    value: unknown
): asserts value is { source: 'visitor-auth-cookie'; basePath: string; token: string } {
    if (
        value &&
        typeof value === 'object' &&
        'source' in value &&
        value.source === 'visitor-auth-cookie'
    ) {
        return;
    }

    throw new Error('Expected a VisitorAuthCookieValue');
}
