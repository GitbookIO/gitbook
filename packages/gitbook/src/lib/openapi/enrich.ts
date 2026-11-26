import { type Filesystem, traverse } from '@gitbook/openapi-parser';

import { parseMarkdown } from '../markdown';

/**
 * Enrich a filesystem with HTML descriptions.
 */
export async function enrichFilesystem(filesystem: Filesystem) {
    const parseMarkdownWithCache = createMarkdownParser();
    return traverse(filesystem, async (node, path) => {
        // Examples included: a `$ref` can render an example value as a schema.
        delete node['x-gitbook-description-html'];
        delete node['x-gitbook-description-document'];

        if (
            path !== undefined &&
            'description' in node &&
            typeof node.description === 'string' &&
            node.description
        ) {
            const description = node.description.trim();
            // Examples stay as written, except where their raw description could render a tag.
            const isExample = path[path.length - 1] === 'example';
            if (description && (!isExample || description.includes('<'))) {
                node['x-gitbook-description-html'] = await parseMarkdownWithCache(description);
            }
        }
        return node;
    });
}

/**
 * Create a markdown parser that caches the results of parsing.
 */
const createMarkdownParser = () => {
    // A Map rather than an object so descriptions like "constructor" don't hit prototype keys.
    const cache = new Map<string, Promise<string>>();
    return (input: string) => {
        const existing = cache.get(input);
        if (existing) {
            return existing;
        }

        const result = parseMarkdown(input);
        cache.set(input, result);
        return result;
    };
};
