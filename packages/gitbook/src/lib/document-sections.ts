import { JSONDocument, ContentRef, Space } from '@gitbook/api';

import { getDocument } from './api';
import { getNodeText } from './document';
import { fetchOpenAPIBlock } from './openapi/fetch';
import { ResolvedContentRef } from './references';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: string;
    depth: number;
    deprecated?: boolean;
}

/**
 * Extract a list of sections from a document.
 */
export async function getDocumentSections(
    space: Space,
    document: JSONDocument,
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>,
): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];
    let depth = 0;

    for (const block of document.nodes) {
        if ((block.type === 'heading-1' || block.type === 'heading-2') && block.meta?.id) {
            if (block.type === 'heading-1') {
                depth = 1;
            }
            const title = getNodeText(block);
            const id = block.meta.id;

            sections.push({
                id,
                title,
                depth: block.type === 'heading-1' ? 1 : depth > 0 ? 2 : 1,
            });
        }

        if (block.type === 'swagger' && block.meta?.id) {
            const { data: operation } = await fetchOpenAPIBlock(block, resolveContentRef);
            if (operation) {
                sections.push({
                    id: block.meta.id,
                    tag: operation.method.toUpperCase(),
                    title: operation.operation.summary ?? operation.path,
                    depth: 1,
                    deprecated: operation.operation.deprecated,
                });
            }
        }

        if (block.type === 'reusable-content') {
            const resolved = await resolveContentRef(block.data.ref);
            const documentId = resolved?.reusableContent?.document;
            if (!documentId) {
                throw new Error(`Expected a document ID for reusable content block`);
            }

            const document = await getDocument(space.id, documentId);
            if (!document) {
                throw new Error(`Document not found for reusable content block`);
            }

            const resuableContentSections = await getDocumentSections(
                space,
                document,
                resolveContentRef,
            );
            sections.push(
                ...resuableContentSections.map((section) => ({
                    ...section,
                    depth: section.depth + depth,
                })),
            );
        }
    }

    return sections;
}
