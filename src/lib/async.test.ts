import { describe, expect, it } from 'bun:test';

import { race } from './async';
import { flushWaitUntil } from './waitUntil';

describe('race', () => {
    it('should return on the first result and delay the others', async () => {
        const result = await race(
            [
                [2, 20],
                [1, 10],
                [3, 30],
            ],
            async ([value, timeout]) => {
                await new Promise((resolve) => setTimeout(resolve, timeout));
                return value;
            },
        );

        expect(result).toBe(1);
        expect(await flushWaitUntil()).toHaveLength(3);
    });

    it('should ignore null resolutions', async () => {
        const result = await race(
            [
                [2, 20],
                [null, 10],
                [3, 30],
            ] as const,
            async ([value, timeout]) => {
                await new Promise((resolve) => setTimeout(resolve, timeout));
                return value;
            },
        );

        expect(result).toBe(2);
        expect(await flushWaitUntil()).toHaveLength(2);
    });

    it('should ignore errors', async () => {
        const result = await race(
            [
                [new Error('test'), 20],
                [null, 10],
                [3, 30],
            ] as const,
            async ([value, timeout]) => {
                await new Promise((resolve) => setTimeout(resolve, timeout));

                if (value instanceof Error) {
                    throw value;
                }

                return value;
            },
        );

        expect(result).toBe(3);
        expect(await flushWaitUntil()).toHaveLength(1);
    });

    it('should pass an abort signal to each input', async () => {
        const result = await race(
            [
                [2, 20],
                [1, 10],
                [3, 30],
            ],
            async ([value, timeout], { signal }) => {
                await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(resolve, timeout);

                    signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        reject(new Error('Aborted'));
                    });
                });
                return value;
            },
        );

        expect(result).toBe(1);
        expect(await flushWaitUntil()).toHaveLength(3);
    });

    it('should respect timeout', async () => {
        const result = await race(
            [
                [1, 10],
                [2, 20],
                [3, 30],
            ],
            async ([value, timeout]) => {
                await new Promise((resolve) => setTimeout(resolve, timeout));
                return value;
            },
            {
                timeout: 5,
            },
        );

        expect(result).toBe(null);
        expect(await flushWaitUntil()).toHaveLength(3);
    });

    describe('signal', () => {
        it('should abort all inputs', async () => {
            let abortted = 0;

            const abort = new AbortController();

            setTimeout(() => {
                abort.abort();
            }, 5);

            await expect(
                race(
                    [
                        [2, 20],
                        [1, 10],
                        [3, 30],
                    ],
                    async ([value, timeout], { signal }) => {
                        await new Promise((resolve, reject) => {
                            const timeoutId = setTimeout(resolve, timeout);

                            signal.addEventListener('abort', () => {
                                abortted += 1;

                                clearTimeout(timeoutId);
                                reject(new Error('Aborted'));
                            });
                        });
                        return value;
                    },
                    {
                        signal: abort.signal,
                    },
                ),
            ).rejects.toThrow('The operation was aborted.');

            expect(abortted).toBe(3);
        });
    });

    describe('blockTimeout', () => {
        it('should fallback if blockTimeout is reached', async () => {
            const result = await race(
                [
                    [null, 10],
                    [2, 200],
                    [1, 100],
                    [3, 300],
                ] as const,
                async ([value, timeout], { signal }) => {
                    await new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(resolve, timeout);

                        signal.addEventListener('abort', () => {
                            clearTimeout(timeoutId);
                            reject(new Error('Aborted'));
                        });
                    });
                    return value;
                },
                {
                    blockTimeout: 20,
                    blockFallback: async () => {
                        return 4;
                    },
                },
            );

            expect(result).toBe(4);
            expect(await flushWaitUntil()).toHaveLength(3);
        });

        it('should resolve only if fallback if blockTimeout is reached', async () => {
            const result = await race(
                [
                    [null, 10],
                    [2, 15],
                    [1, 100],
                    [3, 300],
                ] as const,
                async ([value, timeout], { signal }) => {
                    await new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(resolve, timeout);

                        signal.addEventListener('abort', () => {
                            clearTimeout(timeoutId);
                            reject(new Error('Aborted'));
                        });
                    });
                    return value;
                },
                {
                    blockTimeout: 20,
                    blockFallback: async () => {
                        return 4;
                    },
                },
            );

            expect(result).toBe(2);
            expect(await flushWaitUntil()).toHaveLength(3);
        });

        it('should resolve with fallback if all inputs resolved to null', async () => {
            const result = await race(
                [
                    [null, 20],
                    [null, 25],
                    [null, 30],
                ] as const,
                async ([value, timeout], { signal }) => {
                    await new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(resolve, timeout);

                        signal.addEventListener('abort', () => {
                            clearTimeout(timeoutId);
                            reject(new Error('Aborted'));
                        });
                    });
                    return value;
                },
                {
                    blockTimeout: 15,
                    blockFallback: async () => {
                        // Wait for all inputs to resolve
                        await new Promise((resolve) => setTimeout(resolve, 30));
                        return 4;
                    },
                },
            );

            expect(result).toBe(4);

            const pendings = await flushWaitUntil();
            expect(pendings).toHaveLength(0);
        });

        it('should throw error from fallback if fallbackOnNull is set to true after inputs finished', async () => {
            await expect(
                race(
                    [
                        [null, 3],
                        [null, 4],
                        [null, 5],
                    ] as const,
                    async ([value, timeout], { signal }) => {
                        await new Promise((resolve, reject) => {
                            const timeoutId = setTimeout(resolve, timeout);

                            signal.addEventListener('abort', () => {
                                clearTimeout(timeoutId);
                                reject(new Error('Aborted'));
                            });
                        });

                        return value;
                    },
                    {
                        blockTimeout: 15,
                        blockFallback: async () => {
                            // Wait for all inputs to resolve
                            throw new Error('Fallback error');
                        },
                        fallbackOnNull: true,
                    },
                ),
            ).rejects.toThrow('Fallback error');

            const pendings = await flushWaitUntil();
            expect(pendings).toHaveLength(0);
        });

        it('should throw error from fallback if fallbackOnNull is set to true before inputs finished with null', async () => {
            await expect(
                race(
                    [
                        [null, 30],
                        [null, 40],
                        [null, 50],
                    ] as const,
                    async ([value, timeout], { signal }) => {
                        await new Promise((resolve, reject) => {
                            const timeoutId = setTimeout(resolve, timeout);

                            signal.addEventListener('abort', () => {
                                clearTimeout(timeoutId);
                                reject(new Error('Aborted'));
                            });
                        });

                        return value;
                    },
                    {
                        blockTimeout: 5,
                        blockFallback: async () => {
                            throw new Error('Fallback error');
                        },
                        fallbackOnNull: true,
                    },
                ),
            ).rejects.toThrow('Fallback error');

            const pendings = await flushWaitUntil();
            expect(pendings).toHaveLength(0);
        });

        it('should not throw error from fallback if fallbackOnNull is set to true before inputs finished with non-null null', async () => {
            const result = await race(
                [
                    [null, 10],
                    ['done', 15],
                    [null, 20],
                ] as const,
                async ([value, timeout], { signal }) => {
                    await new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(resolve, timeout);

                        signal.addEventListener('abort', () => {
                            clearTimeout(timeoutId);
                            reject(new Error('Aborted'));
                        });
                    });

                    return value;
                },
                {
                    blockTimeout: 5,
                    blockFallback: async () => {
                        throw new Error('Fallback error');
                    },
                    fallbackOnNull: true,
                },
            );
            expect(result).toBe('done');

            const pendings = await flushWaitUntil();
            expect(pendings).toHaveLength(2);
        });

        it('should throw the error if the blockFallback fails after the inputs with fallbackOnNull=false', async () => {
            await expect(
                race(
                    [
                        [null, 10],
                        [null, 15],
                        [null, 20],
                    ] as const,
                    async ([value, timeout], { signal }) => {
                        await new Promise((resolve, reject) => {
                            const timeoutId = setTimeout(resolve, timeout);

                            signal.addEventListener('abort', () => {
                                clearTimeout(timeoutId);
                                reject(new Error('Aborted'));
                            });
                        });

                        return value;
                    },
                    {
                        blockTimeout: 5,
                        blockFallback: async () => {
                            // Sleep 30ms to make sure all inputs are resolved
                            await new Promise((resolve) => setTimeout(resolve, 30));
                            throw new Error('Fallback error');
                        },
                        fallbackOnNull: false,
                    },
                ),
            ).rejects.toThrow('Fallback error');

            const pendings = await flushWaitUntil();
            expect(pendings).toHaveLength(0);
        });
    });
});
