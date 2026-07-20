import type { ResponseCookie, ResponseCookies } from './visitors';

const COOKIE_CHUNK_SIZE = 4_000;
const MAX_COOKIE_CHUNKS = 3;
export const MAX_API_TOKEN_COOKIE_LENGTH = COOKIE_CHUNK_SIZE * MAX_COOKIE_CHUNKS;

type RequestCookie = Pick<ResponseCookie, 'name' | 'value'>;

/**
 *
 * Retrieves the API token from the provided cookies, handling both single-cookie and chunked representations.
 * We need to split the token into multiple cookies if it exceeds the size limit of a single cookie (4,000 characters).
 * Some sites go over that limit which then cause an infinite redirect loop.
 */
export function getAPITokenFromCookies(
    cookies: readonly RequestCookie[],
    cookieName: string
): string | undefined {
    const cookie = cookies.find(({ name }) => name === cookieName);
    if (!cookie) {
        return undefined;
    }

    const chunkCount = parseChunkCount(cookie.value);
    // If chunk count is undefined, it means the cookie is a single value (not chunked), so we can return it directly.
    if (chunkCount === undefined) {
        return cookie.value;
    }

    if (chunkCount > MAX_COOKIE_CHUNKS) {
        return undefined;
    }

    const chunks = new Map<number, string>();
    const chunkNamePrefix = `${cookieName}-`;
    for (const { name, value } of cookies) {
        if (!name.startsWith(chunkNamePrefix)) {
            continue;
        }

        const indexValue = name.slice(chunkNamePrefix.length);
        const index = Number(indexValue);
        if (/^\d+$/.test(indexValue) && Number.isSafeInteger(index) && index >= 0) {
            chunks.set(index, value);
        }
    }

    // A numeric legacy token remains a single cookie until at least one chunk identifies it as chunked.
    if (chunks.size === 0) {
        return cookie.value;
    }

    // We don't have all the chunks, so we can't reconstruct the token.
    // We consider this a missing token
    if (chunks.size < chunkCount) {
        return undefined;
    }

    const tokenChunks: string[] = [];
    for (let index = 0; index < chunkCount; index++) {
        const chunk = chunks.get(index);
        if (chunk === undefined) {
            return undefined;
        }
        tokenChunks.push(chunk);
    }

    return tokenChunks.join('');
}

export function getAPITokenResponseCookies(input: {
    cookies: readonly RequestCookie[];
    cookieName: string;
    apiToken: string;
    options: NonNullable<ResponseCookie['options']>;
}): ResponseCookies {
    const { cookies, cookieName, apiToken, options } = input;
    if (apiToken.length > MAX_API_TOKEN_COOKIE_LENGTH) {
        throw new APITokenCookieTooLargeError();
    }

    const chunks = splitIntoCookieChunks(apiToken);
    const previousChunkCount = getPreviousChunkCount(cookies, cookieName);
    const responseCookies: ResponseCookies =
        chunks.length === 1
            ? [{ name: cookieName, value: apiToken, options }]
            : [
                  { name: cookieName, value: String(chunks.length), options },
                  ...chunks.map((value, index) => ({
                      name: `${cookieName}-${index}`,
                      value,
                      options,
                  })),
              ];

    const firstChunkToExpire = chunks.length === 1 ? 0 : chunks.length;
    for (let index = firstChunkToExpire; index < previousChunkCount; index++) {
        responseCookies.push({
            name: `${cookieName}-${index}`,
            value: '',
            options: { ...options, maxAge: 0 },
        });
    }

    return responseCookies;
}

function splitIntoCookieChunks(value: string): string[] {
    if (value.length <= COOKIE_CHUNK_SIZE) {
        return [value];
    }

    const chunks: string[] = [];
    for (let start = 0; start < value.length; start += COOKIE_CHUNK_SIZE) {
        chunks.push(value.slice(start, start + COOKIE_CHUNK_SIZE));
    }
    return chunks;
}

function getPreviousChunkCount(cookies: readonly RequestCookie[], cookieName: string): number {
    const cookie = cookies.find(({ name }) => name === cookieName);
    const chunkCount = cookie ? parseChunkCount(cookie.value) : undefined;
    return chunkCount && chunkCount <= MAX_COOKIE_CHUNKS ? chunkCount : 0;
}

function parseChunkCount(value: string): number | undefined {
    if (!/^(?:[2-9]|[1-9]\d+)$/.test(value)) {
        return undefined;
    }

    const count = Number(value);
    return Number.isSafeInteger(count) ? count : undefined;
}

export class APITokenCookieTooLargeError extends Error {
    constructor() {
        super(`API token exceeds the ${MAX_API_TOKEN_COOKIE_LENGTH}-character cookie limit`);
    }
}
