import { AsyncLocalStorage } from 'node:async_hooks';

/*
 * This code is ONLY for v1.
 */

/**
 * Set a header on the middleware response.
 * We do this because of https://github.com/opennextjs/opennextjs-cloudflare/issues/92
 * It can be removed as soon as we move to opennext where hopefully this is fixed.
 */
export function setMiddlewareHeader(response: Response, name: string, value: string) {
    const responseHeadersLocalStorage =
        // @ts-ignore
        globalThis.responseHeadersLocalStorage as AsyncLocalStorage<Headers> | undefined;
    const responseHeaders = responseHeadersLocalStorage?.getStore();
    response.headers.set(name, value);

    if (responseHeaders) {
        responseHeaders.set(name, value);
    }
}

/**
 * Wrap some middleware with a the storage to store headers.
 */
export async function withMiddlewareHeadersStorage(
    handler: () => Promise<Response>
): Promise<Response> {
    const responseHeadersLocalStorage =
        // @ts-ignore
        (globalThis.responseHeadersLocalStorage as AsyncLocalStorage<Headers>) ??
        new AsyncLocalStorage<Headers>();
    // @ts-ignore
    globalThis.responseHeadersLocalStorage = responseHeadersLocalStorage;

    const responseHeaders = new Headers();
    const response = await responseHeadersLocalStorage.run(responseHeaders, handler);

    for (const [name, value] of responseHeaders.entries()) {
        response.headers.set(name, value);
    }

    return response;
}
