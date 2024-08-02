import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { pageHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { ToggleableLinkItem } from './ToggleableLinkItem';
import { TOCPageIcon } from './TOCPageIcon';

export function PageDocumentItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const { rootPages, page, ancestors, context } = props;

    return (
        <li className={tcls('flex', 'flex-col')}>
            <ToggleableLinkItem
                href={pageHref(rootPages, page)}
                pathname={getPagePath(rootPages, page)}
                descendants={
                    page.pages && page.pages.length ? (
                        <PagesList
                            rootPages={rootPages}
                            pages={page.pages}
                            style={tcls(
                                'ms-5',
                                'my-2',
                                'border-l',
                                'border-dark/3',
                                'dark:border-light/2',
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
