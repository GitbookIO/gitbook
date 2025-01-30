'use server';

import { DocumentBlockCode } from '@gitbook/api';

import { highlight, RenderedInline } from './highlight';

/**
 * Server action to highlight a code block.
 * By using a server action, we can avoid loading the highlighter on the client-side
 * and increasing the bundle size.
 */
export async function highlightAction(block: DocumentBlockCode, inlines: RenderedInline[]) {
    return highlight(block, inlines);
}
