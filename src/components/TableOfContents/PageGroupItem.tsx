import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';

export function PageGroupItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageGroup;
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const { rootPages, page, activePage, ancestors, context } = props;

    return (
        <li className={tcls('flex', 'flex-col')}>
            <div
                className={tcls(
                    'px-5',
                    'pt-6',
                    'pb-1.5',
                    'text-xs',
                    'tracking-wide',
                    'font-semibold',
                    'uppercase',
                    'z-[1]',
                    'sticky',
                    'top-0',
                    'bg-gradient-to-b',
                    'from-light',
                    'to-transparent',
                    'from-65%',
                    'dark:from-dark',
                    'dark:tracking-wider',
                    'dark:to-transparent',
                )}
            >
                {page.title}
            </div>
            {page.pages && page.pages.length ? (
                <PagesList
                    rootPages={rootPages}
                    pages={page.pages}
                    activePage={activePage}
                    ancestors={ancestors}
                    context={context}
                />
            ) : null}
        </li>
    );
}
