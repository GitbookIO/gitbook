import assertNever from 'assert-never';

import type { ContentRef, RevisionPage, RevisionPageTag, RevisionTag } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { getOpenAPIOperationPageProps } from '@/lib/openapi/computedSourceProps';
import { hasPageVisibleDescendant } from '@/lib/pages';
import { resolveContentRef } from '@/lib/references';
import { getSiteSpacePagePaths } from '@/lib/sites';
import { getRevisionTags, resolveTag } from '@/lib/tags';
import { removeUndefined } from '@/lib/typescript';

export type ClientTOCPageLink = {
    type: 'link';
    id: string;
    title: string;
    href: string;
    emoji?: string;
    icon?: string;
    target: ContentRef;
    /** Paths of the page this link points to, when it resolves to a page in the current space. */
    pathnames?: string[];
    /** Anchor the link points to on that page, when the target is a section of it. */
    anchor?: string;
};

export type ClientTOCPageDocument = {
    type: 'document';
    id: string;
    title: string;
    href: string;
    emoji?: string;
    icon?: string;
    pathnames: string[];
    descendants?: ClientTOCPage[];
    primaryTag?: RevisionTag;
    openAPIOperation?: { method: string; deprecated: boolean };
};

export type ClientTOCPageGroup = {
    type: 'group';
    id: string;
    title: string;
    emoji?: string;
    icon?: string;
    descendants?: ClientTOCPage[];
};

export type ClientTOCPage = ClientTOCPageLink | ClientTOCPageDocument | ClientTOCPageGroup;

/**
 *
 * Encodes a table of contents for client components.
 * We do this to reduce the amount of data sent as RSC, we only send the encoded ClientTableOfContents once to a single client component.
 */
export async function encodeClientTableOfContents(
    context: GitBookSiteContext,
    rootPages: RevisionPage[],
    pages: RevisionPage[]
): Promise<ClientTOCPage[]> {
    const result: ClientTOCPage[] = [];

    for (const page of pages) {
        if (page.type === 'computed') {
            throw new Error('Unexpected computed page, it should have been computed in the API');
        }

        if (page.hidden) {
            continue;
        }

        switch (page.type) {
            case 'document': {
                let href = context.linker.toPathForPage({ pages: rootPages, page });
                if (href === '') {
                    href = '/';
                }

                const descendants = hasPageVisibleDescendant(page)
                    ? await encodeClientTableOfContents(context, rootPages, page.pages)
                    : undefined;

                const primaryTag = resolvePrimaryTag(page.tags, context);

                result.push(
                    removeUndefined({
                        id: page.id,
                        title: page.linkTitle || page.title,
                        href,
                        emoji: page.emoji,
                        icon: page.icon,
                        pathnames: getSiteSpacePagePaths(context.siteSpace, rootPages, page),
                        descendants,
                        primaryTag,
                        openAPIOperation: getOpenAPIOperationPageProps(page),
                        type: 'document',
                    })
                );
                break;
            }
            case 'link': {
                const resolved = await resolveContentRef(page.target, context);
                // Links to a page (or a section of one) in the current space compute their active
                // state the same way page entries do. Cross-space and external targets are left out
                // to avoid over-highlighting.
                const targetPage =
                    (page.target.kind === 'page' || page.target.kind === 'anchor') &&
                    resolved?.page &&
                    resolved.space?.id === context.space.id
                        ? resolved.page
                        : undefined;
                result.push(
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        href: resolved?.href ?? '#',
                        emoji: page.emoji,
                        icon: page.icon,
                        target: page.target,
                        pathnames: targetPage
                            ? getSiteSpacePagePaths(context.siteSpace, rootPages, targetPage)
                            : undefined,
                        anchor:
                            targetPage && page.target.kind === 'anchor'
                                ? page.target.anchor
                                : undefined,
                        type: 'link',
                    })
                );
                break;
            }
            case 'group': {
                const descendants = hasPageVisibleDescendant(page)
                    ? await encodeClientTableOfContents(context, rootPages, page.pages)
                    : undefined;

                result.push(
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        emoji: page.emoji,
                        icon: page.icon,
                        descendants,
                        type: 'group',
                    })
                );
                break;
            }
            default:
                assertNever(page);
        }
    }

    return result;
}

/**
 * Tags attached to a page can also get a `primary` prop which, when set, is the tag that gets shown in the TOC.
 * - only 1 tag can be primary for available-space reasons.
 * */
function resolvePrimaryTag(
    pageTags: RevisionPageTag[] | undefined,
    context: GitBookSiteContext
): RevisionTag | undefined {
    // TODO: simplify once new API lands as `tags` will always be defined.
    if (!pageTags || pageTags.length === 0) {
        return undefined;
    }

    const primary = pageTags.find((t) => t.primary);
    if (!primary) {
        return undefined;
    }

    const revisionTags = getRevisionTags(context.revision);
    return resolveTag(primary.tag.tag, revisionTags);
}
