import { getPagePath, hasPageVisibleDescendant } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import {
    type RevisionPage,
    type RevisionPageDocument,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItem } from './ToggleableLinkItem';

export async function PageDocumentItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageDocument;
    context: GitBookSiteContext;
}) {
    const { rootPages, page, context } = props;
    const href = context.linker.toPathForPage({ pages: rootPages, page });

    return (
        <li className={tcls('flex', 'flex-col')}>
            <ToggleableLinkItem
                href={href}
                pathname={getPagePath(rootPages, page)}
                insights={{
                    type: 'link_click',
                    link: {
                        target: {
                            kind: 'page',
                            page: page.id,
                        },
                        position: SiteInsightsLinkPosition.Sidebar,
                    },
                }}
                descendants={
                    hasPageVisibleDescendant(page) ? (
                        <PagesList
                            rootPages={rootPages}
                            pages={page.pages}
                            style={tcls(
                                'ml-5',
                                'my-2',
                                'border-tint-subtle',
                                'sidebar-list-default:border-l',
                                'sidebar-list-line:border-l'
                            )}
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
