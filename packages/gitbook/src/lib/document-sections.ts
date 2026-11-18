import type { ReactNode } from 'react';

import type { DocumentBlock, JSONDocument } from '@gitbook/api';
import { getOpenAPISchemaAnchorId } from '@gitbook/openapi-parser';

import { getDataOrNull } from './data';
import { getNodeReactText } from './document';
import { resolveOpenAPIOperationBlock } from './openapi/resolveOpenAPIOperationBlock';
import { resolveOpenAPISchemasBlock } from './openapi/resolveOpenAPISchemasBlock';
import { resolveOpenAPIWebhookBlock } from './openapi/resolveOpenAPIWebhookBlock';
import { resolveContentRef } from './references';
import { getRevisionTags, resolveBlockTags } from './tags';
import type { GitBookAnyContext } from '@/lib/context';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: ReactNode;
    depth: number;
    deprecated?: boolean;
    tags?: string[];
}

/**
 * Depth of the last heading-1 and heading-2 seen, or 0 when there is none.
 */
interface HeadingParents {
    h1: number;
    h2: number;
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
    parents: HeadingParents = { h1: 0, h2: 0 },
    tags?: string[]
): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];
    let { h1, h2 } = parents;

    for (const block of nodes) {
        switch (block.type) {
            case 'heading-1': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                h1 = 1;
                h2 = 0;
                const title = getNodeReactText(block);
                sections.push(withTags({ id, title, depth: h1 }, tags));
                continue;
            }
            case 'heading-2': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                h2 = h1 + 1;
                const title = getNodeReactText(block);
                sections.push(withTags({ id, title, depth: h2 }, tags));
                continue;
            }
            case 'heading-3': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                const title = getNodeReactText(block);
                sections.push(withTags({ id, title, depth: (h2 || h1) + 1 }, tags));
                continue;
            }
            case 'columns':
            case 'stepper': {
                const stepNodes = await Promise.all(
                    block.nodes.map(async (step) =>
                        getSectionsFromNodes(step.nodes, context, { h1, h2 }, tags)
                    )
                );
                for (const stepSections of stepNodes) {
                    sections.push(...stepSections);
                }
                continue;
            }
            case 'updates': {
                const revisionTags = getRevisionTags(context.revision);
                const updateNodes = await Promise.all(
                    block.nodes.map(async (update) =>
                        update.type === 'update'
                            ? getSectionsFromNodes(
                                  update.nodes as DocumentBlock[],
                                  context,
                                  { h1, h2 },
                                  resolveBlockTags(update.data.tags, revisionTags).map(
                                      (tag) => tag.slug
                                  )
                              )
                            : []
                    )
                );
                for (const updateSections of updateNodes) {
                    sections.push(...updateSections);
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
                    sections.push(
                        withTags(
                            {
                                id,
                                tag: operation.method.toUpperCase(),
                                title: operation.operation.summary || operation.path,
                                depth: 1,
                                deprecated: operation.operation.deprecated,
                            },
                            tags
                        )
                    );
                }
                continue;
            }
            case 'openapi-webhook': {
                const id = block.meta?.id;
                if (!id) {
                    continue;
                }
                const { data: webhook } = await resolveOpenAPIWebhookBlock({
                    block,
                    context,
                });
                if (webhook) {
                    sections.push(
                        withTags(
                            {
                                id,
                                title: webhook.operation.summary || webhook.name,
                                depth: 1,
                                deprecated: webhook.operation.deprecated,
                            },
                            tags
                        )
                    );
                }
                continue;
            }
            case 'openapi-schemas': {
                const { data } = await resolveOpenAPISchemasBlock({
                    block,
                    context,
                });

                // A lone model anchors on the block's own id, like an operation.
                if (!block.data.grouped && block.data.schemas.length === 1) {
                    const id = block.meta?.id;
                    const schema = data?.schemas[0];
                    if (id && schema) {
                        sections.push(
                            withTags({ id, title: `The ${schema.name} object`, depth: 1 }, tags)
                        );
                    }
                    continue;
                }

                // Grouped/multiple schemas each render as a deep-linkable model, keyed by name slug.
                for (const schema of data?.schemas ?? []) {
                    const id = getOpenAPISchemaAnchorId(schema.name);
                    if (!id) {
                        continue;
                    }
                    sections.push(withTags({ id, title: schema.name, depth: 1 }, tags));
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
                    { h1, h2 },
                    tags
                );
                sections.push(...reusableContentSections);
            }
        }
    }

    return sections;
}

function withTags(
    section: Omit<DocumentSection, 'tags'>,
    tags: string[] | undefined
): DocumentSection {
    return tags === undefined ? section : { ...section, tags };
}
