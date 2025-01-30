import { AnyObject } from '@scalar/openapi-parser';
import { traverse } from './traverse';

/**
 * Parse descriptions in the spec to markdown.
 */
export async function parseDescriptions<T extends AnyObject>(input: {
    specification: T;
    parseMarkdown: (input: string) => Promise<string>;
}): Promise<T> {
    const { specification, parseMarkdown } = input;
    const promises: Record<string, Promise<string>> = {};
    const results: Record<string, string> = {};
    traverse(specification, (obj, path) => {
        if (checkHasDescription(obj) && path) {
            promises[hashPath(path)] = parseMarkdown(obj.description);
        }
        return obj;
    });
    await Promise.all(
        Object.entries(promises).map(async ([key, promise]) => {
            results[key] = await promise;
        }),
    );
    return traverse(specification, (obj, path) => {
        if (
            checkHasDescription(obj) &&
            typeof obj.description === 'string' &&
            path &&
            results[hashPath(path)]
        ) {
            obj.description = results[hashPath(path)];
        }
        return obj;
    }) as T;
}

/**
 * Check if the object contains a description.
 */
function checkHasDescription(obj: AnyObject): obj is { description: string } {
    return 'description' in obj && typeof obj.description === 'string';
}

/**
 * Hash a path.
 */
function hashPath(path: string[]): string {
    return path.join('/');
}
