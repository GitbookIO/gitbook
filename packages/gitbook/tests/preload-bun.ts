import { mock } from 'bun:test';
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Mock the `server-only` module to avoid errors when running tests as it doesn't work well in Bun
 */
mock.module('server-only', () => {
    return {};
});

/**
 * Next reads `AsyncLocalStorage` from the global it sets up in its node environment, and falls back
 * to a fake that throws on `run`. Tests running code under a work store need the real one.
 */
globalThis.AsyncLocalStorage = AsyncLocalStorage;
