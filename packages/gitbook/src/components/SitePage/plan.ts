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
import { getPageGitMetadata } from '@/components/PageActions/pageActionsData';
import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull, getPageDocument } from '@/lib/data';
import { getSimplifiedContentType } from '@/lib/files';
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
    loadGitMetadata: (context: GitBookSiteContext, page: RevisionPageDocument) => Promise<unknown>;
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
    loadGitMetadata: getPageGitMetadata,
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

    const measure = (src: string | undefined, options: { dpr?: number }) => {
        const resizer = context.imageResizer;
        if (src && resizer) {
            start(() => resizer.getImageSize(src, options));
        }
    };

    const resolveFile = (document: JSONDocument | null, ref: ContentRef) =>
        deps.resolveRef(document, ref, context, {}) as Promise<{
            href: string;
            file?: { dimensions?: unknown; contentType?: string; downloadURL?: string };
        } | null>;

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

    // The Edit on Git action reloads the page with its Git metadata, which the revision tree omits.
    start(() => deps.loadGitMetadata(context, page));

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
                start(async () => {
                    const embed = await getDataOrNull(
                        context.dataFetcher.getEmbedByUrl({
                            url: data.url as string,
                            spaceId: context.space.id,
                        })
                    );
                    // Only link cards render the icon, without a size.
                    if (embed && embed.type !== 'rich' && embed.type !== 'integration') {
                        measure(embed.icon, { dpr: 2 });
                    }
                });
            }
            if (node.type === 'image') {
                for (const ref of [data.ref, data.refDark]) {
                    if (ref) {
                        planImage(document, ref as ContentRef);
                    }
                }
                return;
            }
            if (node.type === 'inline-image') {
                // Line-sized inline images also measure the light image for their width.
                const lineSize = data.size === 'line' ? [{ dpr: 2 }, { dpr: 3 }] : [{ dpr: 2 }];
                if (data.ref) {
                    planImage(document, data.ref as ContentRef, lineSize);
                }
                if (data.refDark) {
                    planImage(document, data.refDark as ContentRef);
                }
                return;
            }
            if (node.type === 'drawing') {
                if (data.ref) {
                    planImage(document, data.ref as ContentRef);
                }
                return;
            }
            if (node.type === 'file' && data.ref) {
                planFilePreview(document, data.ref as ContentRef);
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

    const planRef = (document: JSONDocument | null, ref: ContentRef, anchorText: boolean) => {
        if (needsRequest(ref, anchorText, context)) {
            resolveRef(document, ref, anchorText);
        }
    };

    const planImage = (
        document: JSONDocument | null,
        ref: ContentRef,
        sizes: { dpr?: number }[] = [{ dpr: 2 }]
    ) => {
        startSpaceRevisionFor(ref);
        start(async () => {
            const resolved = await resolveFile(document, ref);
            // Like `Image`, a file with known dimensions is never measured.
            if (resolved && !resolved.file?.dimensions) {
                for (const options of sizes) {
                    measure(resolved.href, options);
                }
            }
        });
    };

    // The file block previews images from their download URL.
    const planFilePreview = (document: JSONDocument, ref: ContentRef) => {
        startSpaceRevisionFor(ref);
        start(async () => {
            const file = (await resolveFile(document, ref))?.file;
            if (
                file &&
                !file.dimensions &&
                getSimplifiedContentType(file.contentType ?? '') === 'image'
            ) {
                measure(file.downloadURL, { dpr: 2 });
            }
        });
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

    const planSite = () => {
        // Links the layout resolves: header, announcement, footer, and link pages of the table of contents.
        const { header: headerLinks, footer: footerLinks, announcement } = context.customization;
        const layoutRefs: (ContentRef | null | undefined)[] = [
            headerLinks.primaryLink,
            // Same condition as `Announcement`, which renders nothing otherwise.
            announcement?.enabled && announcement.message ? announcement.link?.to : undefined,
            ...(headerLinks.links ?? []).flatMap((link) => [
                link.to,
                ...(link.links ?? []).map((sub) => sub.to),
            ]),
            ...(footerLinks.groups ?? []).flatMap((group) =>
                (group.links ?? []).map((link) => link.to)
            ),
        ];
        visitPages(context.revision?.pages, (target) => layoutRefs.push(target));
        for (const ref of layoutRefs) {
            if (ref) {
                planRef(null, ref, false);
            }
        }

        // Logos and the custom icon carry no size, so the layout measures them on every page.
        const { header, footer, favicon } = context.customization;
        if (header.logo) {
            measure(header.logo.light, { dpr: 2 });
            measure(header.logo.dark, { dpr: 2 });
        } else if ('icon' in favicon && favicon.icon) {
            measure(favicon.icon.light, { dpr: 2 });
            measure(favicon.icon.dark, { dpr: 2 });
        }
        if (footer.logo) {
            measure(footer.logo.light, { dpr: 2 });
            measure(footer.logo.dark, { dpr: 2 });
        }

        // Same conditions as SitePage (full/background) and PageBody (hero).
        const coverSize = page.layout?.coverSize;
        if (
            page.cover &&
            page.layout?.cover &&
            (coverSize === 'hero' || coverSize === 'full' || coverSize === 'background')
        ) {
            for (const ref of [page.cover.ref, page.cover.refDark]) {
                if (ref) {
                    planImage(null, ref, [{}]);
                }
            }
        }
    };

    // After every helper above is defined, and inside `start` so nothing throws out of the plan.
    start(async () => planSite());

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

/** Calls `fn` with the target of every link page, as the table of contents resolves them. */
function visitPages(pages: unknown, fn: (target: ContentRef) => void) {
    if (!Array.isArray(pages)) {
        return;
    }
    for (const page of pages as {
        type?: string;
        hidden?: boolean;
        target?: ContentRef;
        pages?: unknown;
    }[]) {
        // The table of contents skips hidden pages and everything under them.
        if (!page || page.hidden) {
            continue;
        }
        if (page.type === 'link' && page.target) {
            fn(page.target);
        }
        visitPages(page.pages, fn);
    }
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
