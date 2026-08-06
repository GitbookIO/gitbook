import { describe, expect, it } from 'bun:test';
import { preloadScalarRuntime } from './ScalarApiButton';

describe('preloadScalarRuntime', () => {
    it('preloads the lazy Scalar runtime as an anonymous script', () => {
        const preloads: Array<[string, unknown]> = [];

        preloadScalarRuntime('https://assets.gitbook.com/scalar.mjs', (href, options) => {
            preloads.push([href, options]);
        });

        expect(preloads).toEqual([
            ['https://assets.gitbook.com/scalar.mjs', { as: 'script', crossOrigin: 'anonymous' }],
        ]);
    });
});
