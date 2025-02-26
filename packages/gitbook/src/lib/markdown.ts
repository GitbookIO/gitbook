import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

/**
 * Parse markdown and output HTML.
 */
export function parseMarkdown(input: string): string {
    return micromark(input, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
    });
}
