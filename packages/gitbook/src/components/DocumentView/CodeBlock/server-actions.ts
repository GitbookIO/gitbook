'use server';

import type { DocumentBlockCode } from '@gitbook/api';
import type { HighlightLine, RenderedInline } from './highlight';
import { highlight } from './highlight';

/**
 * Server action to highlight code blocks.
 * This ensures highlighting always happens on the server, avoiding browser issues.
 */
export async function highlightCodeBlock(
    block: DocumentBlockCode,
    inlines: RenderedInline[]
): Promise<HighlightLine[]> {
    return await highlight(block, inlines);
}
