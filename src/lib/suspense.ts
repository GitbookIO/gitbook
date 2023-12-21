import hash from 'object-hash';

enum CacheStatus {
    PENDING,
    LOADED,
    ERROR,
}

type CacheEntry<Result> =
    | {
          status: CacheStatus.PENDING;
          promise: Promise<Result>;
      }
    | {
          status: CacheStatus.LOADED;
          result: Result;
      }
    | {
          status: CacheStatus.ERROR;
          error: Error;
      };

/**
 * Create a suspense cache.
 * API mimics https://github.com/bvaughn/suspense so that we can use it as a drop-in replacement,
 * once it'll no longer be experimental.
 */
export function createSuspenseCache<Args extends any[], Result>(options: {
    load: (args: Args) => Promise<Result>;
}): {
    read: (...args: Args) => Result;
} {
    const states = new Map<string, CacheEntry<Result>>();

    return {
        read: (...args: Args) => {
            const key = hash(args);

            if (!states.has(key)) {
                const promise = options.load(args).then(
                    (result) => {
                        states.set(key, {
                            status: CacheStatus.LOADED,
                            result,
                        });

                        return result;
                    },
                    (error) => {
                        states.set(key, {
                            status: CacheStatus.ERROR,
                            error,
                        });

                        throw error;
                    },
                );

                states.set(key, {
                    status: CacheStatus.PENDING,
                    promise,
                });

                throw promise;
            }

            const state = states.get(key)!;
            switch (state.status) {
                case CacheStatus.PENDING:
                    throw state.promise;
                case CacheStatus.LOADED:
                    return state.result;
                case CacheStatus.ERROR:
                    throw state.error;
            }
        },
    };
}
