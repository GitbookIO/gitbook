import { describe, expect, it } from 'bun:test';
import { GitBookAPIError } from '@gitbook/api';
import { extractCacheControl } from './errors';

describe('extractCacheControl', () => {
    it('should return undefined when error has no response', () => {
        const error = { message: 'Test error' } as GitBookAPIError;
        const result = extractCacheControl(error);
        expect(result).toBeUndefined();
    });

    it('should return undefined when response has no cache-control header', () => {
        const error = new GitBookAPIError('Test error', new Response(null, {}));

        const result = extractCacheControl(error);
        expect(result).toBeUndefined();
    });

    it('should parse max-age from cache-control header', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control': 'max-age=3600',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: 3600,
            staleWhileRevalidate: undefined,
        });
    });

    it('should parse stale-while-revalidate from cache-control header', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control': 'stale-while-revalidate=86400',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: undefined,
            staleWhileRevalidate: 86400,
        });
    });

    it('should parse both max-age and stale-while-revalidate', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control': 'max-age=3600, stale-while-revalidate=86400',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: 3600,
            staleWhileRevalidate: 86400,
        });
    });

    it('should return undefined for maxAge when it is 0', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control': 'max-age=0, stale-while-revalidate=86400',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: undefined,
            staleWhileRevalidate: 86400,
        });
    });

    it('should handle complex cache-control header with multiple directives', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control':
                        'public, max-age=3600, must-revalidate, stale-while-revalidate=86400',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: 3600,
            staleWhileRevalidate: 86400,
        });
    });

    it('should return undefined when cache-control has no parseable values', () => {
        const error = new GitBookAPIError(
            'Test error',
            new Response(null, {
                headers: {
                    'cache-control': 'no-cache, no-store',
                },
            })
        );

        const result = extractCacheControl(error);
        expect(result).toEqual({
            maxAge: undefined,
            staleWhileRevalidate: undefined,
        });
    });
});
