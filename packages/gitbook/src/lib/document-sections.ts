import type { GitBookAnyContext } from '@/lib/context';
import type { DocumentBlock, JSONDocument } from '@gitbook/api';

import { getNodeText } from './document';
import { resolveOpenAPIOperationBlock } from './openapi/resolveOpenAPIOperationBlock';
import { resolveOpenAPISchemasBlock } from './openapi/resolveOpenAPISchemasBlock';

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
    document: JSONDocument
): Promise<DocumentSection[]> {
    return getSectionsFromNodes(document.nodes, context);
}

/**
 * Extract a list of sections from a list of nodes.
 */
async function getSectionsFromNodes(
    nodes: DocumentBlock[],
    context: GitBookAnyContext
): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];
    let depth = 0;

    for (const block of nodes) {
        switch (block.type) {
            case 'heading-1': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                depth = 1;
                const title = getNodeText(block);
                sections.push({
                    id,
                    title,
                    depth: 1,
                });
                continue;
            }
            case 'heading-2': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                const title = getNodeText(block);
                sections.push({
                    id,
                    title,
                    depth: depth > 0 ? 2 : 1,
                });
                continue;
            }
            case 'stepper': {
                const stepNodes = await Promise.all(
                    block.nodes.map(async (step) => getSectionsFromNodes(step.nodes, context))
                );
                for (const stepSections of stepNodes) {
                    sections.push(...stepSections);
                }
                continue;
            }
            case 'swagger':
            case 'openapi-operation': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                const { data: operation } = await resolveOpenAPIOperationBlock({
                    block,
                    context,
                });
                if (operation) {
                    sections.push({
                        id,
                        tag: operation.method.toUpperCase(),
                        title: operation.operation.summary || operation.path,
                        depth: 1,
                        deprecated: operation.operation.deprecated,
                    });
                }
                continue;
            }
            case 'openapi-schemas': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                if (block.data.grouped || block.data.schemas.length !== 1) {
                    // Skip grouped schemas, they are not sections
                    continue;
                }

                const { data } = await resolveOpenAPISchemasBlock({
                    block,
                    context,
                });
                const schema = data?.schemas[0];
                if (schema) {
                    sections.push({
                        id,
                        title: `The ${schema.name} object`,
                        depth: 1,
                    });
                }
                continue;
            }
        }
    }

    return sections;
}
