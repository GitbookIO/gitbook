'use server';

import { DocumentBlockCode } from '@gitbook/api';

import { highlight, RenderedInline } from './highlight';

export async function highlightAction(block: DocumentBlockCode, inlines: RenderedInline[]) {
    return highlight(block, inlines);
}
