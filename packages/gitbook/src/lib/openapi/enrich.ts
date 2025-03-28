import { type Filesystem, traverse } from '@gitbook/openapi-parser';

import { parseMarkdown } from '../markdown';

/**
 * Enrich a filesystem with HTML descriptions.
 */
export async function enrichFilesystem(filesystem: Filesystem) {
    const parseMarkdownWithCache = createMarkdownParser();
    return traverse(filesystem, async (node, path) => {
        if (
            path !== undefined &&
            'description' in node &&
            typeof node.description === 'string' &&
            node.description
        ) {
            const key = path[path.length - 1];
            // Avoid parsing descriptions in examples.
            if (key !== 'example') {
                const description = node.description.trim();
                if (description) {
                    node['x-gitbook-description-html'] = await parseMarkdownWithCache(description);
                }
            }
        }
        return node;
    });
}

/**
 * Create a markdown parser that caches the results of parsing.
 */
const createMarkdownParser = () => (input: string) => {
    const cache: Record<string, Promise<string>> = {};
    const existing = cache[input];
    if (existing) {
        return existing;
    }

    const result = parseMarkdown(input);
    cache[input] = result;
    return result;
};
