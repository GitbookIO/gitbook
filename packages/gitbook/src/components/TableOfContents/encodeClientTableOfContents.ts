import type { GitBookSiteContext } from '@/lib/context';
import { getPagePaths, hasPageVisibleDescendant } from '@/lib/pages';
import { resolveContentRef } from '@/lib/references';
import { type RevisionPage, SiteInsightsLinkPosition } from '@gitbook/api';
import assertNever from 'assert-never';
import type { TrackEventInput } from '../Insights';

export type ClientTOCPage = {
    id: string;
    title: string;
    href?: string;
    emoji?: string | null;
    icon?: string | null;
    pathnames: string[];
    insights?: TrackEventInput<'link_click'>;
    descendants?: ClientTOCPage[];
    type: 'document' | 'link' | 'group';
};

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

                result.push({
                    id: page.id,
                    title: page.title,
                    href,
                    emoji: page.emoji,
                    icon: page.icon,
                    pathnames: getPagePaths(rootPages, page),
                    insights: {
                        type: 'link_click',
                        link: {
                            target: { kind: 'page', page: page.id },
                            position: SiteInsightsLinkPosition.Sidebar,
                        },
                    },
                    descendants,
                    type: 'document',
                });
                break;
            }
            case 'link': {
                const resolved = await resolveContentRef(page.target, context);
                result.push({
                    id: page.id,
                    title: page.title,
                    href: resolved?.href ?? '#',
                    emoji: page.emoji,
                    icon: page.icon,
                    pathnames: [],
                    insights: {
                        type: 'link_click',
                        link: {
                            target: page.target,
                            position: SiteInsightsLinkPosition.Sidebar,
                        },
                    },
                    type: 'link',
                });
                break;
            }
            case 'group': {
                const descendants = hasPageVisibleDescendant(page)
                    ? await encodeClientTableOfContents(context, rootPages, page.pages)
                    : undefined;

                result.push({
                    id: page.id,
                    title: page.title,
                    emoji: page.emoji,
                    icon: page.icon,
                    pathnames: [],
                    descendants,
                    type: 'group',
                });
                break;
            }
            default:
                assertNever(page);
        }
    }

    return result;
}
