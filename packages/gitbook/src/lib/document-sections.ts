import type { GitBookAnyContext } from '@v2/lib/context';

import { getNodeText } from './document';
import { resolveOpenAPIOperationBlock } from './openapi/resolveOpenAPIOperationBlock';
import { resolveOpenAPISchemasBlock } from './openapi/resolveOpenAPISchemasBlock';
import type { SlimJSONDocument } from './slim-document';

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
    document: SlimJSONDocument
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

        if ((block.type === 'swagger' || block.type === 'openapi-operation') && block.meta?.id) {
            const { data: operation } = await resolveOpenAPIOperationBlock({
                block,
                context,
            });
            if (operation) {
                sections.push({
                    id: block.meta.id,
                    tag: operation.method.toUpperCase(),
                    title: operation.operation.summary || operation.path,
                    depth: 1,
                    deprecated: operation.operation.deprecated,
                });
            }
        }

        if (
            block.type === 'openapi-schemas' &&
            !block.data.grouped &&
            block.meta?.id &&
            block.data.schemas.length === 1
        ) {
            const { data } = await resolveOpenAPISchemasBlock({
                block,
                context,
            });
            const schema = data?.schemas[0];
            if (schema) {
                sections.push({
                    id: block.meta.id,
                    title: `The ${schema.name} object`,
                    depth: 1,
                });
            }
        }
    }

    return sections;
}
