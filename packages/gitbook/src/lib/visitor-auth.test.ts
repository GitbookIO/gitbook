import { it, describe, expect } from 'bun:test';
import { NextRequest } from 'next/server';

import {
    VisitorAuthCookieValue,
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
    getVisitorAuthToken,
} from './visitor-auth';

describe('getVisitorAuthToken', () => {
    it('should return the token from the query parameters', () => {
        const request = nextRequest('https://example.com?jwt_token=123');
        expect(getVisitorAuthToken(request, request.nextUrl)).toEqual('123');
    });

    it('should return the token from the cookie root basepath', () => {
        const request = nextRequest('https://example.com', {
            [getVisitorAuthCookieName('/')]: { value: getVisitorAuthCookieValue('/', '123') },
        });
        const visitorAuth = getVisitorAuthToken(request, request.nextUrl);
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return the token from the cookie root basepath for a sub-path', () => {
        const request = nextRequest('https://example.com/hello/world', {
            [getVisitorAuthCookieName('/')]: { value: getVisitorAuthCookieValue('/', '123') },
        });
        const visitorAuth = getVisitorAuthToken(request, request.nextUrl);
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return the closest token from the path', () => {
        const request = nextRequest('https://example.com/hello/world', {
            [getVisitorAuthCookieName('/')]: { value: getVisitorAuthCookieValue('/', 'no') },
            [getVisitorAuthCookieName('/hello/')]: {
                value: getVisitorAuthCookieValue('/hello/', '123'),
            },
        });
        const visitorAuth = getVisitorAuthToken(request, request.nextUrl);
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return the token from the cookie in a collection type url', () => {
        const request = nextRequest('https://example.com/hello/v/space1/cool', {
            [getVisitorAuthCookieName('/hello/v/space1/')]: {
                value: getVisitorAuthCookieValue('/hello/v/space1/', '123'),
            },
        });
        const visitorAuth = getVisitorAuthToken(request, request.nextUrl);
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('123');
    });

    it('should return undefined if no cookie and no query param', () => {
        const request = nextRequest('https://example.com');
        expect(getVisitorAuthToken(request, request.nextUrl)).toBeUndefined();
    });

    // For backwards compatibility
    it('should return the token from the cookie of a /v/ path when the url does not have /v/', () => {
        const request = nextRequest('https://example.com/hello/space1/cool', {
            [getVisitorAuthCookieName('/')]: { value: getVisitorAuthCookieValue('/', 'no') },
            [getVisitorAuthCookieName('/hello/v/space1/')]: {
                value: getVisitorAuthCookieValue('/hello/v/space1/', 'gotcha'),
            },
        });

        const visitorAuth = getVisitorAuthToken(request, request.nextUrl);
        assertVisitorAuthCookieValue(visitorAuth);
        expect(visitorAuth.token).toEqual('gotcha');
    });
});

function assertVisitorAuthCookieValue(value: unknown): asserts value is VisitorAuthCookieValue {
    if (value && typeof value === 'object' && 'token' in value) {
        return;
    }

    throw new Error('Expected a VisitorAuthCookieValue');
}

function nextRequest(url: string, cookies: Record<string, { value: string }> = {}) {
    const nextUrl = new URL(url);
    // @ts-ignore
    return {
        url: nextUrl.toString(),
        nextUrl,
        headers: new Headers(),
        cookies: Object.entries(cookies),
    } as NextRequest;
}
