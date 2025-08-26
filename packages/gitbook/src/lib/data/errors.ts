import { GitBookAPIError } from '@gitbook/api';
import { parse as parseCacheControl } from '@tusbar/cache-control';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import type { DataFetcherErrorData, DataFetcherResponse } from './types';

export class DataFetcherError extends Error {
    constructor(
        message: string,
        public readonly code: number
    ) {
        super(message);
    }
}

/**
 * Throw an error if the response contains an error.
 */
export function throwIfDataError<T>(response: DataFetcherResponse<T>): T;
export function throwIfDataError<T>(response: Promise<DataFetcherResponse<T>>): Promise<T>;
export function throwIfDataError<T>(
    response: DataFetcherResponse<T> | Promise<DataFetcherResponse<T>>
): T | Promise<T> {
    if (response instanceof Promise) {
        return response.then((result) => throwIfDataError(result));
    }

    if (response.error) {
        throw new DataFetcherError(response.error.message, response.error.code);
    }
    return response.data;
}

/**
 * Get the data from the response or null if there is an "Not found" error.
 */
export function getDataOrNull<T>(
    response: DataFetcherResponse<T>,
    ignoreErrors?: number[]
): T | null;
export function getDataOrNull<T>(
    response: Promise<DataFetcherResponse<T>>,
    ignoreErrors?: number[]
): Promise<T | null>;
export function getDataOrNull<T>(
    response: DataFetcherResponse<T> | Promise<DataFetcherResponse<T>>,
    ignoreErrors: number[] = [404]
): T | null | Promise<T | null> {
    if (response instanceof Promise) {
        return response.then((result) => getDataOrNull(result, ignoreErrors));
    }

    return ignoreDataFetcherErrors(response, ignoreErrors).data ?? null;
}

/**
 * Ignore error for an API or data call.
 */
export async function ignoreDataThrownError<T>(promise: Promise<T>): Promise<T | null> {
    try {
        return await promise;
    } catch (error) {
        getExposableError(error as Error);
        return null;
    }
}

/**
 * Ignore all errors for an API or data call.
 */
export async function ignoreAllThrownError<T>(promise: Promise<T>): Promise<T | null> {
    try {
        return await promise;
    } catch (error) {
        console.warn('Ignoring error', error);
        return null;
    }
}

/**
 * Wrap an async execution to handle errors and return a DataFetcherResponse.
 */
export async function wrapDataFetcherError<T>(
    fn: () => Promise<T>
): Promise<DataFetcherResponse<T>> {
    try {
        return { data: await fn() };
    } catch (error) {
        return {
            error: getExposableError(error as Error),
        };
    }
}

/**
 * Wrap an async execution to handle errors and return a DataFetcherResponse.
 * This should be used inside 'use cache' functions.
 */
export async function wrapCacheDataFetcherError<T>(
    fn: () => Promise<T>
): Promise<DataFetcherResponse<T>> {
    const result = await wrapDataFetcherError(fn);
    if (result.error) {
        const cacheValue = result.error.cache;
        // We only want to cache 404 errors for "long", because that's an "expected" error.
        if (result.error.code === 404) {
            cacheLife({
                stale: 60,
                revalidate: cacheValue?.maxAge ?? 60 * 60, // 1 hour
                expire: cacheValue?.staleWhileRevalidate ?? 60 * 60 * 24, // 1 day
            });
        } else {
            cacheLife({
                stale: 60, // This one is only for the client
                revalidate: cacheValue?.maxAge ?? 30, // we don't want to cache it for too long, but at least 30 seconds to avoid hammering the API
                expire: cacheValue?.staleWhileRevalidate ?? 90, // we want to revalidate this error after 90 seconds for sure
            });
        }
    }
    return result;
}

/**
 * Ignore some data fetcher errors.
 */
export function ignoreDataFetcherErrors<T>(
    response: DataFetcherResponse<T>,
    ignoreErrors?: number[]
): DataFetcherResponse<T>;
export function ignoreDataFetcherErrors<T>(
    response: Promise<DataFetcherResponse<T>>,
    ignoreErrors?: number[]
): Promise<DataFetcherResponse<T>>;
export function ignoreDataFetcherErrors<T>(
    response: DataFetcherResponse<T> | Promise<DataFetcherResponse<T>>,
    ignoreErrors: number[] = [404]
): DataFetcherResponse<T> | Promise<DataFetcherResponse<T>> {
    if (response instanceof Promise) {
        return response.then((result) => ignoreDataFetcherErrors(result, ignoreErrors));
    }

    if (response.error) {
        if (ignoreErrors.includes(response.error.code)) {
            return response;
        }
        throw new DataFetcherError(response.error.message, response.error.code);
    }
    return response;
}

/**
 * Extract cache control information from a GitBookAPIError.
 * If the error does not have a response or no cache-control, it returns undefined.
 */
export function extractCacheControl(error: GitBookAPIError) {
    try {
        if (!error.response) {
            return undefined;
        }

        const cacheControl = error.response.headers.get('cache-control');
        if (!cacheControl) {
            return undefined;
        }
        const parsed = parseCacheControl(cacheControl);

        const maxAge = parsed?.maxAge ?? parsed?.sharedMaxAge ?? 0;
        const staleWhileRevalidate = parsed.staleWhileRevalidate ?? undefined;

        return {
            // If maxAge is 0, we want to apply the default, not 0
            maxAge: maxAge === 0 ? undefined : maxAge,
            staleWhileRevalidate,
        };
    } catch {
        return undefined;
    }
}

/**
 * Get a data fetcher exposable error from a JS error.
 */
export function getExposableError(error: Error): DataFetcherErrorData {
    if (error instanceof GitBookAPIError) {
        const cache = extractCacheControl(error);

        return {
            code: error.code,
            message: error.errorMessage,
            cache,
        };
    }

    if (error instanceof DataFetcherError) {
        return {
            code: error.code,
            message: error.message,
        };
    }

    throw error;
}
