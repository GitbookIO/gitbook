import { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';

export function PageGroupItem(props: {
    page: RevisionPageGroup;
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
}) {
    const { page, activePage, ancestors } = props;

    return (
        <li className={tcls('flex', 'flex-col', 'my-3')}>
            <div className={tcls('px-2', 'py-1.5', 'text-m', 'text-slate-900', 'font-medium')}>
                {page.title}
            </div>
            {page.pages && page.pages.length ? (
                <PagesList pages={page.pages} activePage={activePage} ancestors={ancestors} />
            ) : null}
        </li>
    );
}
