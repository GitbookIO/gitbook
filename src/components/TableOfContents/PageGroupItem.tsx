import { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { clsx } from 'clsx';
import { PagesList } from './PagesList';

export function PageGroupItem(props: {
    page: RevisionPageGroup;
    activePage: RevisionPageDocument;
}) {
    const { page, activePage } = props;

    return (
        <li className={clsx('flex', 'flex-col', 'my-3')}>
            <div className={clsx('px-2', 'py-1.5', 'text-m', 'text-slate-900', 'font-medium')}>
                {page.title}
            </div>
            {page.pages && page.pages.length ? (
                <PagesList pages={page.pages} activePage={activePage} />
            ) : null}
        </li>
    );
}
