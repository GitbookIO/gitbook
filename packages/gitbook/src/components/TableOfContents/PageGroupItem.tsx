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
                    'px-5',
                    'z-[1]',
                    'sticky',

                    '-top-4',
                    'pt-6',
                    'group-first/page-group-item:-mt-4',
                    'pb-4',
                    '-mb-2',

                    'text-xs',
                    'tracking-wide',
                    'font-semibold',
                    'uppercase',

                    'bg-gradient-to-b',
                    'from-light',
                    'sidebar-filled:from-light-2',
                    'sidebar-filled:dark:from-dark-2',
                    'to-transparent',
                    'from-70%',
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
