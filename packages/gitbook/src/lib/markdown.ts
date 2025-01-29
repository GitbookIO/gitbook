import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const cache: Record<string, Promise<string>> = {};

/**
 * Parse markdown and output HTML.
 */
export async function parseMarkdown(markdown: string): Promise<string> {
    // @ts-expect-error no-index-check
    if (cache[markdown]) {
        return cache[markdown];
    }

    const promise = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(markdown)
        .then((file) => file.toString());

    cache[markdown] = promise;
    return promise;
}
