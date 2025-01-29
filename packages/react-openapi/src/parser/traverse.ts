import { AnyObject } from '@scalar/openapi-parser';

/**
 * Recursively traverses the specification and applies the transform function to each node.
 * The one from @scalar/openapi-parser does not support recursion.
 */
export function traverse(
    specification: AnyObject,
    transform: (specification: AnyObject, path?: string[]) => AnyObject,
    path: string[] = [],
    seen = new WeakSet(),
) {
    const result: AnyObject = {};
    if (seen.has(specification)) {
        return specification;
    }

    seen.add(specification);

    for (const [key, value] of Object.entries(specification)) {
        const currentPath = [...path, key];
        if (Array.isArray(value)) {
            result[key] = value.map((item, index) => {
                if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
                    return traverse(item, transform, [...currentPath, index.toString()], seen);
                }

                return item;
            });
        } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            result[key] = traverse(value, transform, currentPath, seen);
        } else {
            result[key] = value;
        }
    }

    return transform(result, path);
}
