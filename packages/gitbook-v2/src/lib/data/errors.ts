import { GitBookAPIError } from '@gitbook/api';
import type { DataFetcherResponse } from './types';

/**
 * Throw an error if the response contains an error.
 */
export function throwIfError<T>(response: DataFetcherResponse<T>): T;
export function throwIfError<T>(response: Promise<DataFetcherResponse<T>>): Promise<T>;
export function throwIfError<T>(
    response: DataFetcherResponse<T> | Promise<DataFetcherResponse<T>>
): T | Promise<T> {
    if (response instanceof Promise) {
        return response.then((result) => throwIfError(result));
    }

    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.data;
}

/**
 * Get the data from the response or null if there is an error.
 */
export function getDataOrNull<T>(response: DataFetcherResponse<T>): T | null;
export function getDataOrNull<T>(response: Promise<DataFetcherResponse<T>>): Promise<T | null>;
export function getDataOrNull<T>(
    response: DataFetcherResponse<T> | Promise<DataFetcherResponse<T>>
): T | null | Promise<T | null> {
    if (response instanceof Promise) {
        return response.then((result) => getDataOrNull(result));
    }

    if (response.error) {
        return null;
    }
    return response.data;
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
        if (error instanceof GitBookAPIError) {
            return {
                error: {
                    code: error.code,
                    message: error.errorMessage,
                },
            };
        }

        throw error;
    }
}
