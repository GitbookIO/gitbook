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
    await Promise.all(
        keys.map(async (key) => {
            const value = specification[key];
            result[key] = await traverse(value, transform, [...path, key], seen);
        })
    );

    return transform(result, path) as Promise<T>;
}
