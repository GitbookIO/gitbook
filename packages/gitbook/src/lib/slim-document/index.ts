import type { DocumentBlock, DocumentBlocksTopLevels, JSONDocument } from '@gitbook/api';
import { type SlimifyDocumentBlock, all } from './util';

/**
 * Slim version of DocumentBlocksTopLevels.
 */
export type SlimDocumentBlocksTopLevels = SlimifyDocumentBlock<DocumentBlocksTopLevels>;

/**
 * Slim version of a DocumentBlock.
 */
export type SlimDocumentBlock = SlimifyDocumentBlock<DocumentBlock>;

/**
 * Slim version of a JSON document.
 */
export interface SlimJSONDocument extends Omit<JSONDocument, 'nodes'> {
    nodes: SlimDocumentBlocksTopLevels[];
}

// Re-export all slim block types.
export type { SlimDocumentBlockCode } from './blocks/code';
export type { SlimDocumentBlockCodeLine } from './blocks/code-line';

/**
 * Transform a document to a slim version.
 */
export function getSlimJSONDocument(document: JSONDocument): SlimJSONDocument {
    return {
        ...document,
        nodes: all(document.nodes),
    };
}

export { one as getSlimDocumentBlock } from './util';
