import { JSONDocument, ContentRef } from '@gitbook/api';

import { getNodeText } from './document';
import { resolveOpenAPIBlock } from './openapi/fetch';
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
            const { data: operation } = await resolveOpenAPIBlock({
                block,
                context: { resolveContentRef },
            });
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
    }

    return sections;
}
