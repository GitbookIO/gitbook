import { GitBookAPIError } from '@gitbook/api';
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

    if (response.error) {
        if (ignoreErrors.includes(response.error.code)) return null;
        throw new DataFetcherError(response.error.message, response.error.code);
    }
    return response.data;
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
 * Get a data fetcher exposable error from a JS error.
 */
export function getExposableError(error: Error): DataFetcherErrorData {
    if (error instanceof GitBookAPIError) {
        return {
            code: error.code,
            message: error.errorMessage,
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
