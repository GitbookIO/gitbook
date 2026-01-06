import type { GitBookAnyContext } from '@/lib/context';
import type { DocumentBlock, JSONDocument } from '@gitbook/api';

import type { ReactNode } from 'react';
import { getDataOrNull } from './data';
import { getNodeReactText } from './document';
import { resolveOpenAPIOperationBlock } from './openapi/resolveOpenAPIOperationBlock';
import { resolveOpenAPISchemasBlock } from './openapi/resolveOpenAPISchemasBlock';
import { resolveContentRef } from './references';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: ReactNode;
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
    context: GitBookAnyContext,
    initialDepth = 0
): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];
    let depth = initialDepth;

    for (const block of nodes) {
        switch (block.type) {
            case 'heading-1': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                depth = 1;
                const title = getNodeReactText(block);
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
                const title = getNodeReactText(block);
                sections.push({
                    id,
                    title,
                    depth: depth > 0 ? 2 : 1,
                });
                continue;
            }
            case 'stepper': {
                const stepNodes = await Promise.all(
                    block.nodes.map(async (step) =>
                        getSectionsFromNodes(step.nodes, context, depth)
                    )
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
            case 'reusable-content': {
                const dataFetcher = block.meta?.token
                    ? context.dataFetcher.withToken({ apiToken: block.meta.token })
                    : context.dataFetcher;

                const resolved = await resolveContentRef(block.data.ref, {
                    ...context,
                    dataFetcher,
                });
                if (!resolved) {
                    continue;
                }
                const { reusableContent } = resolved;
                if (!reusableContent) {
                    continue;
                }
                const document = await getDataOrNull(
                    dataFetcher.getRevisionReusableContentDocument({
                        spaceId: reusableContent.context.space.id,
                        revisionId: reusableContent.context.revisionId,
                        reusableContentId: reusableContent.revisionReusableContent.id,
                    })
                );
                if (!document) {
                    continue;
                }
                const reusableContentSections = await getSectionsFromNodes(
                    document.nodes,
                    reusableContent.context,
                    depth
                );
                sections.push(...reusableContentSections);
            }
        }
    }

    return sections;
}
