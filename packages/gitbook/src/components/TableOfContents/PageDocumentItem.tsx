import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { headers } from 'next/headers';

import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getPageHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export async function PageDocumentItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { rootPages, page, ancestors, context } = props;
    const href = await getPageHref(ctx, rootPages, page);

    return (
        <li className={tcls('flex', 'flex-col')}>
            <ToggleableLinkItem
                href={href}
                pathname={getPagePath(rootPages, page)}
                insights={{
                    target: {
                        kind: 'page',
                        page: page.id,
                    },
                    position: 'sidebar',
                }}
                descendants={
                    page.pages && page.pages.length ? (
                        <PagesList
                            rootPages={rootPages}
                            pages={page.pages}
                            style={tcls(
                                'ml-5',
                                'my-2',
                                'border-dark/3',
                                'dark:border-light/2',
                                'sidebar-list-default:border-l',
                                'sidebar-list-line:border-l',
                            )}
                            ancestors={ancestors}
                            context={context}
                        />
                    ) : null
                }
            >
                {page.emoji || page.icon ? (
                    <span className={tcls('flex', 'gap-3', 'items-center')}>
                        <TOCPageIcon page={page} />
                        {page.title}
                    </span>
                ) : (
                    page.title
                )}
            </ToggleableLinkItem>
        </li>
    );
}
