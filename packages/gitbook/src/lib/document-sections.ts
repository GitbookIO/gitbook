import { JSONDocument } from '@gitbook/api';
import { GitBookAnyContext } from '@v2/lib/context';

import { getNodeText } from './document';
import { resolveOpenAPIBlock } from './openapi/fetch';

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
    context: GitBookAnyContext,
    document: JSONDocument,
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
                context,
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
