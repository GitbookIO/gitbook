import type { DocumentBlockCode } from '@gitbook/api';
import { type SlimifyDocumentBlocks, all } from '../util';

/**
 * Slim version of a DocumentBlock.
 * We transform the document into a slim version to reduce the size of the data
 * stored in cache and sent to the client.
 */
export interface SlimDocumentBlockCode extends Omit<DocumentBlockCode, 'nodes'> {
    nodes: SlimifyDocumentBlocks<DocumentBlockCode['nodes']>;
}
/**
 * Transform a code block into a slim version.
 */
export function transform(block: DocumentBlockCode): SlimDocumentBlockCode {
    return {
        ...block,
        nodes: all(block.nodes),
    };
}
