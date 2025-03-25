import pMemoize from 'p-memoize';

/**
 * We wrap 'use cache' calls in a p-memoize function to avoid
 * executing the function multiple times when doing concurrent calls.
 *
 * Hopefully one day this can be done directly by 'use cache'.
 */
export function memoize<F extends (...args: any[]) => any>(f: F): F {
    return pMemoize(f, {
        cacheKey: (args) => {
            return JSON.stringify(deepSortValue(args));
        },
    });
}

function deepSortValue(value: unknown): unknown {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepSortValue);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, subValue]) => {
                return [key, deepSortValue(subValue)] as const;
            })
            .sort((a, b) => {
                return a[0].localeCompare(b[0]);
            });
    }

    return value;
}
