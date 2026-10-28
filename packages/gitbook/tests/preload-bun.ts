import { mock } from 'bun:test';

/**
 * Mock the `server-only` module to avoid errors when running tests as it doesn't work well in Bun
 */
mock.module('server-only', () => {
    return {};
});
