import { micromark } from 'micromark';
import { gfmHtml, gfm } from 'micromark-extension-gfm';

/**
 * Parse markdown and output HTML.
 */
export function parseMarkdown(input: string): string {
    return micromark(input, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
    });
}
