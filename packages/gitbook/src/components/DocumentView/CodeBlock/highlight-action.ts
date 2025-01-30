'use server';

import { DocumentBlockCode } from '@gitbook/api';

import { highlight, RichInlineIndexed } from './highlight';

export async function highlightAction(block: DocumentBlockCode, inlines: RichInlineIndexed[]) {
    return highlight(block, inlines);
}
