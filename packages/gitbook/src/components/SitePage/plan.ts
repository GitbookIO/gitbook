import type {
    ContentRef,
    DocumentBlockTable,
    JSONDocument,
    RevisionPageDocument,
} from '@gitbook/api';

import {
    getRecordCardCovers,
    isDocumentTableImageRecord,
    isStringArray,
} from '@/components/DocumentView/Table/utils';
import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull, getPageDocument } from '@/lib/data';
import {
    getContentInlineIconSourceRequests,
    getCustomizationIconStyle,
    getInlineIconSources,
} from '@/lib/icons/inline';
import {
    type ResolveContentRefOptions,
    resolveContentRef,
    resolveContentRefInDocument,
} from '@/lib/references';
import { findSiteSpaceBy } from '@/lib/sites';

type Deps = {
    /** `document` is null for refs that don't come from the page document (meta links). */
    resolveRef: (
        document: JSONDocument | null,
        ref: ContentRef,
        context: GitBookSiteContext,
        options: ResolveContentRefOptions
    ) => Promise<unknown>;
    loadIcons: (context: GitBookSiteContext, document: JSONDocument) => Promise<unknown>;
};

const defaultDeps: Deps = {
    resolveRef: (document, ref, context, options) =>
        document
            ? resolveContentRefInDocument(document, ref, context, options)
            : resolveContentRef(ref, context, options),
    loadIcons: (context, document) =>
        getInlineIconSources(
            getContentInlineIconSourceRequests({
                iconStyle: getCustomizationIconStyle(context.customization),
                document,
            })
        ),
};

type Node = { object?: string; type?: string; data?: Record<string, unknown>; nodes?: unknown };

/** Node types the render resolves with `resolveAnchorText: true` (an extra page document). */
const ANCHOR_TEXT_TYPES = new Set(['mention', 'content-ref']);

/**
 * Start every request a site page render will make, as soon as its input is known, instead of
 * when React reaches the component that needs it. Each call is the one the render makes, with
 * the same arguments, so the render reuses it through the per-request memo of the data fetcher
 * (and of the image size and icon helpers). Failures are left for the render to surface.
 */
export function runSitePagePlan(
    context: GitBookSiteContext,
    page: RevisionPageDocument,
    deps: Deps = defaultDeps
): Promise<void> {
    const pending: Promise<unknown>[] = [];
    const start = (fn: () => Promise<unknown>) => {
        let promise: Promise<unknown>;
        try {
            promise = fn();
        } catch (error) {
            promise = Promise.reject(error);
        }
        pending.push(promise.catch(() => {}));
    };

    const resolveRef = (document: JSONDocument | null, ref: ContentRef, anchorText: boolean) => {
        startSpaceRevisionFor(ref);
        start(() =>
            deps.resolveRef(document, ref, context, anchorText ? { resolveAnchorText: true } : {})
        );
    };

    // Cross-space refs fetch the space, then its revision; the site structure already knows the
    // revision, so start both. A stale structure only costs one unused (usually cached) call.
    const startSpaceRevisionFor = (ref: ContentRef) => {
        const spaceId = 'space' in ref ? ref.space : undefined;
        if (!spaceId || spaceId === context.space.id) {
            return;
        }
        const found = findSiteSpaceBy(context.structure, (s) => s.space.id === spaceId);
        if (found) {
            start(() =>
                context.dataFetcher.getRevision({
                    spaceId,
                    revisionId: found.siteSpace.space.revision,
                })
            );
        }
    };

    const ids = { spaceId: context.space.id, revisionId: context.revisionId, pageId: page.id };

    start(async () => {
        const links = await getDataOrNull(context.dataFetcher.listRevisionPageMetaLinks(ids));
        for (const ref of [links?.canonical, ...(links?.alternates ?? [])]) {
            if (ref) {
                resolveRef(null, ref, false);
            }
        }
    });

    start(async () => {
        const document = await getPageDocument(context, page);
        if (!document) {
            return;
        }
        start(() => deps.loadIcons(context, document));
        visit(document.nodes, (node) => {
            const data = node.data ?? {};
            if (node.type === 'embed' && typeof data.url === 'string') {
                start(() =>
                    context.dataFetcher.getEmbedByUrl({
                        url: data.url as string,
                        spaceId: context.space.id,
                    })
                );
            }
            if (node.type === 'image') {
                for (const ref of [data.ref, data.refDark]) {
                    if (ref) {
                        planImage(document, ref as ContentRef);
                    }
                }
                return;
            }
            if (node.type === 'table') {
                // Through `start` so a malformed table can't stop the rest of the walk.
                start(async () =>
                    planTable(document, node.data as unknown as DocumentBlockTable['data'])
                );
            }
            const ref = data.ref as ContentRef | undefined;
            if (ref) {
                planRef(document, ref, ANCHOR_TEXT_TYPES.has(node.type ?? ''));
            }
        });
    });

    const planRef = (document: JSONDocument, ref: ContentRef, anchorText: boolean) => {
        if (needsRequest(ref, anchorText, context)) {
            resolveRef(document, ref, anchorText);
        }
    };

    const planImage = (document: JSONDocument, ref: ContentRef) => {
        startSpaceRevisionFor(ref);
        start(() => measureImage(document, ref));
    };

    // Only what the table view renders: its columns, plus covers and target for cards.
    const planTable = (document: JSONDocument, table: DocumentBlockTable['data']) => {
        const { view, definition } = table;
        for (const record of Object.values(table.records ?? {})) {
            for (const column of view.columns ?? []) {
                const value = record.values[column];
                switch (definition[column]?.type) {
                    case 'content-ref':
                        if (value && typeof value === 'object' && 'kind' in value) {
                            planRef(document, value as ContentRef, true);
                        }
                        break;
                    case 'users':
                        if (isStringArray(value)) {
                            for (const user of value) {
                                resolveRef(document, { kind: 'user', user }, false);
                            }
                        }
                        break;
                    case 'image':
                        if (isDocumentTableImageRecord(value)) {
                            planImage(document, 'ref' in value ? value.ref : value);
                        }
                        break;
                }
            }
            if (view.type === 'cards') {
                const { light, dark } = getRecordCardCovers(record, view);
                // The dark cover only renders alongside a light one.
                if (light.contentRef) {
                    planImage(document, light.contentRef);
                    if (dark.contentRef) {
                        planImage(document, dark.contentRef);
                    }
                }
                const target = view.targetDefinition
                    ? (record.values[view.targetDefinition] as ContentRef | undefined)
                    : undefined;
                if (target) {
                    planRef(document, target, false);
                }
            }
        }
    };

    // Same as the images block: a file without known dimensions is measured by the resizer.
    const measureImage = async (document: JSONDocument, ref: ContentRef) => {
        const resolved = (await deps.resolveRef(document, ref, context, {})) as {
            href: string;
            file?: { dimensions?: unknown };
        } | null;
        if (resolved && !resolved.file?.dimensions) {
            await context.imageResizer?.getImageSize(resolved.href, { dpr: 2 });
        }
    };

    return settle(pending);
}

/** Whether resolving `ref` makes a request; same-space page and file refs resolve in memory. */
function needsRequest(ref: ContentRef, anchorText: boolean, context: GitBookSiteContext) {
    if ('space' in ref && ref.space && ref.space !== context.space.id) {
        return true;
    }
    if (ref.kind === 'user' || ref.kind === 'openapi') {
        return true;
    }
    return ref.kind === 'anchor' && anchorText;
}

function visit(nodes: unknown, fn: (node: Node) => void) {
    if (!Array.isArray(nodes)) {
        return;
    }
    for (const node of nodes as Node[]) {
        if (node && (node.object === 'block' || node.object === 'inline')) {
            fn(node);
            visit(node.nodes, fn);
            visit((node as { fragments?: unknown }).fragments, fn);
        }
    }
}

/** Waits for every started call, including ones started while waiting. */
async function settle(pending: Promise<unknown>[]) {
    let settled = 0;
    while (settled < pending.length) {
        const batch = pending.slice(settled);
        settled = pending.length;
        await Promise.all(batch);
    }
}
