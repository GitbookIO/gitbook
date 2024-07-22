import { Mock, beforeEach, describe, expect, it, mock } from 'bun:test';

import { CacheFunction, CacheFunctionOptions, cache } from './cache';

describe('cache', () => {
    const impl = mock((arg: string) => 'test-' + arg);

    let fn: CacheFunction<[string], string>;
    let testId = 0;
    let getTtl: () => number;

    beforeEach(() => {
        impl.mockClear();

        testId += 1;
        getTtl = () => 1000;

        fn = cache(`cache-${testId}`, async (arg: string, options: CacheFunctionOptions) => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            return {
                data: impl(arg),
                ttl: getTtl(),
            };
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
