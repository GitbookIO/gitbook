import {
    MAX_CHUNKED_COOKIE_LENGTH,
    type RequestCookie,
    getChunkedCookieValue,
    getChunkedResponseCookies,
} from './chunked-cookies';
import type { ResponseCookie, ResponseCookies } from './visitors';

/**
 * Retrieves the API token from the provided cookies, handling both single-cookie and chunked representations.
 * We need to split the token into multiple cookies if it exceeds the size limit of a single cookie (4,000 characters).
 * Some sites go over that limit which then cause an infinite redirect loop.
 */
export function getAPITokenFromCookies(
    cookies: readonly RequestCookie[],
    cookieName: string
): string | undefined {
    return getChunkedCookieValue(cookies, cookieName);
}

export function getAPITokenResponseCookies(input: {
    cookies: readonly RequestCookie[];
    cookieName: string;
    apiToken: string;
    options: NonNullable<ResponseCookie['options']>;
}): ResponseCookies {
    const { cookies, cookieName, apiToken, options } = input;
    if (apiToken.length > MAX_CHUNKED_COOKIE_LENGTH) {
        throw new APITokenCookieTooLargeError();
    }
    return getChunkedResponseCookies({ cookies, cookieName, value: apiToken, options });
}

export class APITokenCookieTooLargeError extends Error {
    constructor() {
        super(`API token exceeds the ${MAX_CHUNKED_COOKIE_LENGTH}-character cookie limit`);
    }
}
