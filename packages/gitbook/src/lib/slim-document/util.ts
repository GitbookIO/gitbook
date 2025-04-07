import type { DocumentBlock, DocumentBlockCode, DocumentBlockCodeLine } from '@gitbook/api';
import * as codeBlock from './blocks/code';
import * as codeLineBlock from './blocks/code-line';

type TransformMap = {
    [T in DocumentBlock as T['type']]: (block: T) => SlimifyDocumentBlock<T>;
};

/**
 * Contains all block transformations.
 * The key is the block type, and the value is the transform function.
 */
const transforms: Partial<TransformMap> = {
    code: codeBlock.transform,
    'code-line': codeLineBlock.transform,
};

/**
 * Transform any DocumentBlock into a slim version.
 */
export type SlimifyDocumentBlock<T extends DocumentBlock> = T extends DocumentBlockCode
    ? codeBlock.SlimDocumentBlockCode
    : T extends DocumentBlockCodeLine
      ? codeLineBlock.SlimDocumentBlockCodeLine
      : T;

/**
 * Transform all blocks to a slim version.
 */
export function all<T extends DocumentBlock[]>(blocks: T): SlimifyDocumentBlocks<T> {
    return blocks.map((block) => one(block)) as SlimifyDocumentBlocks<T>;
}

/**
 * Transform a block to a slim version.
 */
export function one<T extends DocumentBlock>(block: T): SlimifyDocumentBlock<T> {
    const transform = transforms[block.type];
    if (transform) {
        return transform(block as any) as SlimifyDocumentBlock<T>;
    }
    return block as SlimifyDocumentBlock<T>;
}

/**
 * Transform an array of DocumentBlock into a slim version.
 */
export type SlimifyDocumentBlocks<T extends DocumentBlock[]> = {
    [K in keyof T]: T[K] extends DocumentBlock ? SlimifyDocumentBlock<T[K]> : T[K];
};
