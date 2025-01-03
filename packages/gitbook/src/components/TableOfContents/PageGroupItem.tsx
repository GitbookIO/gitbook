import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';

export function PageGroupItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageGroup;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const { rootPages, page, ancestors, context } = props;

    return (
        <li className={tcls('flex', 'flex-col', 'group/page-group-item')}>
            <div
                className={tcls(
                    'flex',
                    'items-center',

                    'gap-3',
                    'px-3',
                    'z-[1]',
                    'sticky',
                    '-top-5',
                    'pt-6',
                    'group-first/page-group-item:-mt-5',
                    'pb-3', // Add extra padding to make the header fade a bit nicer
                    '-mb-1.5', // Then pull the page items a bit closer, effective bottom padding is 1.5 units / 6px.

                    'text-xs',
                    'tracking-wide',
                    'font-semibold',
                    'uppercase',

                    'bg-gradient-to-b',
                    'from-70%', // We want the fade to start past the header, this is a good approximation.
                    'from-light',
                    'sidebar-filled:from-light-2',
                    '[html.tint.sidebar-filled_&]:from-light-1',
                    'dark:from-dark',
                    'dark:sidebar-filled:from-dark-1',
                    'dark:[html.tint.sidebar-filled_&]:from-dark-1',
                    'to-transparent',
                )}
            >
                <TOCPageIcon page={page} />
                {page.title}
            </div>
            {page.pages && page.pages.length ? (
                <PagesList
                    rootPages={rootPages}
                    pages={page.pages}
                    ancestors={ancestors}
                    context={context}
                />
            ) : null}
        </li>
    );
}
