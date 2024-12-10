import { beforeEach, describe, expect, it, Mock, mock } from 'bun:test';
import hash from 'object-hash';

import { CacheDefinition, CacheFunction, CacheFunctionOptions, cache } from './cache';

describe('cache', () => {
    const impl = mock((arg: string) => 'test-' + arg);

    let fn: CacheFunction<[string], string>;
    let testId = 0;
    let getTtl: () => number;

    beforeEach(() => {
        impl.mockClear();

        testId += 1;
        getTtl = () => 1000;

        fn = cache({
            name: `cache-${testId}`,
            tag: (arg) => 'test',
            get: async (arg: string, options: CacheFunctionOptions) => {
                await new Promise((resolve) => setTimeout(resolve, 20));
                return {
                    data: impl(arg),
                    ttl: getTtl(),
                };
            },
        });
    });

    it('should only execute once for same argument if there is a ttl', async () => {
        const result = await Promise.all([fn('a'), fn('a')]);

        expect(result).toEqual(['test-a', 'test-a']);

        expect(impl).toHaveBeenCalled();
        expect(impl).toHaveBeenCalledTimes(1);

        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(1);
    });

    it('should execute multiple times for same argument if ttl is 0 or undefined', async () => {
        getTtl = () => 0;

        const result = await Promise.all([fn('a'), fn('a')]);

        expect(result).toEqual(['test-a', 'test-a']);

        expect(impl).toHaveBeenCalled();
        expect(impl).toHaveBeenCalledTimes(1);

        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);
    });

    it('should execute for different arguments', async () => {
        const result = await Promise.all([fn('a'), fn('b')]);

        expect(result).toEqual(['test-a', 'test-b']);

        expect(impl).toHaveBeenCalled();
        expect(impl).toHaveBeenCalledTimes(2);

        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);
    });
});

describe('cache with suffix key', () => {
    const impl = mock((arg: string) => 'test-' + arg);
    const getKeySuffixImpl: Mock<NonNullable<CacheDefinition<[string], string>['getKeySuffix']>> =
        mock(() => hash({ test: 1 }));

    let fn: CacheFunction<[string], string>;
    let testId = 0;
    let getTtl: () => number;

    beforeEach(() => {
        impl.mockClear();

        testId += 1;
        getTtl = () => 1000;

        fn = cache({
            name: `cache-with-suffix-${testId}`,
            getKeySuffix: getKeySuffixImpl,
            tag: (arg) => 'test',
            get: async (arg: string, options: CacheFunctionOptions) => {
                await new Promise((resolve) => setTimeout(resolve, 20));
                return {
                    data: impl(arg),
                    ttl: getTtl(),
                };
            },
        });
    });

    it('should execute when the key suffix changes even if the args do not change', async () => {
        const result = await Promise.all([fn('a'), fn('b')]);

        expect(result).toEqual(['test-a', 'test-b']);

        expect(impl).toHaveBeenCalled();
        expect(impl).toHaveBeenCalledTimes(2);

        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);

        getKeySuffixImpl.mockImplementation(() => hash({ test: 2 }));
        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(3);
    });

    it('should preserve behaviour even when the returned key suffix is undefined', async () => {
        // Start with the returned suffix being undefined
        getKeySuffixImpl.mockImplementation(() => undefined);
        const result = await fn('a');
        expect(result).toEqual('test-a');

        expect(impl).toHaveBeenCalled();
        expect(impl).toHaveBeenCalledTimes(1);

        // The returned suffix changes so we should get the value computed by the function
        getKeySuffixImpl.mockImplementation(() => hash({ test: 1 }));
        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);

        // The returned suffix is undefined again so we should get the value from a previous cache entry
        getKeySuffixImpl.mockImplementation(() => undefined);
        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);

        // The returned suffix goes back to a previous hash so we should the value from a previous cache entry
        getKeySuffixImpl.mockImplementation(() => hash({ test: 1 }));
        expect(await fn('a')).toEqual('test-a');

        expect(impl).toHaveBeenCalledTimes(2);
    });
});
