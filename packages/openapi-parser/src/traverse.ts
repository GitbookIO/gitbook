import type { AnyObject } from '@scalar/openapi-parser';

/**
 * Recursively traverses the specification and applies the transform function to each node.
 * The one from @scalar/openapi-parser does not support recursion.
 */
export async function traverse<T extends AnyObject | AnyObject[]>(
    specification: T,
    transform: (specification: AnyObject, path?: string[]) => AnyObject | Promise<AnyObject>,
    path: string[] = [],
    seen = new WeakSet()
): Promise<T> {
    const result: AnyObject = {};

    if (typeof specification !== 'object' || specification === null) {
        return specification as Promise<T>;
    }

    if (seen.has(specification)) {
        return specification as Promise<T>;
    }

    if (Array.isArray(specification)) {
        return Promise.all(
            specification.map((item, index) =>
                traverse(item, transform, [...path, index.toString()], seen)
            )
        ) as Promise<T>;
    }

    const keys = Object.keys(specification);
    const results = await Promise.all(
        keys.map(async (key, index) => {
            const value = specification[key];
            const processed = await traverse(value, transform, [...path, key], seen);
            return { key, value: processed, index };
        })
    );

    // Promise.all does not guarantee the order of the results
    // So we need to sort them to preserve the original order
    results.sort((a, b) => a.index - b.index);
    for (const { key, value } of results) {
        result[key] = value;
    }

    return transform(result, path) as Promise<T>;
}
