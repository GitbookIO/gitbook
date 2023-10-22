import { RevisionPageDocument } from '@gitbook/api';
import { clsx } from 'clsx';
import Link from 'next/link';
import { PagesList } from './PagesList';
import { pageHref } from '@/lib/links';

export function PageDocumentItem(props: {
    page: RevisionPageDocument;
    activePage: RevisionPageDocument;
}) {
    const { page, activePage } = props;

    return (
        <li className={clsx('flex', 'flex-col', 'mb-0.5')}>
            <Link
                href={pageHref(page.path || '')}
                className={clsx(
                    'rounded',
                    'px-2',
                    'py-1.5',
                    'text-sm',
                    'transition-colors',
                    'duration-200',
                    activePage.id === page.id
                        ? ['bg-primary-100', 'text-primary-500', 'font-semibold']
                        : ['hover:bg-slate-100', 'text-slate-500', 'font-normal'],
                )}
            >
                {page.title}
            </Link>
            {page.pages && page.pages.length ? (
                <PagesList pages={page.pages} style={clsx('ms-4')} activePage={activePage} />
            ) : null}
        </li>
    );
}
