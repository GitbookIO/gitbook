import {
    RevisionPage,
    RevisionPageDocument,
    RevisionPageGroup,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { getPageHref } from '@/lib/links';
import { getPagePath, hasPageVisibleDescendant } from '@/lib/pages';
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
    const { rootPages, page, ancestors, context } = props;
    const href = await getPageHref(rootPages, page);

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
