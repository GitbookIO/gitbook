import type { GitBookSiteContext } from '@/lib/context';
import { getPagePaths, hasPageVisibleDescendant } from '@/lib/pages';
import { resolveContentRef } from '@/lib/references';
import type { ContentRef, RevisionPage } from '@gitbook/api';
import assertNever from 'assert-never';

export type ClientTOCPage = {
    id: string;
    title: string;
    href?: string;
    emoji?: string;
    icon?: string;
    pathnames: string[];
    descendants?: ClientTOCPage[];
    target?: ContentRef;
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

                result.push(
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        href,
                        emoji: page.emoji,
                        icon: page.icon,
                        pathnames: getPagePaths(rootPages, page),
                        descendants,
                        type: 'document',
                    })
                );
                break;
            }
            case 'link': {
                const resolved = await resolveContentRef(page.target, context);
                result.push(
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        href: resolved?.href ?? '#',
                        emoji: page.emoji,
                        icon: page.icon,
                        target: page.target,
                        pathnames: [],
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
                        pathnames: [],
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function removeUndefined<T extends Record<string, any>>(obj: T): any {
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key as keyof T] = value;
        }
    }

    return result;
}
