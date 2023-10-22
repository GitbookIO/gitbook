import { RevisionPageDocument } from '@gitbook/api';
import clsx from 'clsx';

export function PageHeader(props: { page: RevisionPageDocument }) {
    const { page } = props;

    return (
        <header>
            <h1 className={clsx('text-4xl', 'font-bold')}>{page.title}</h1>
            {page.description ? (
                <p className={clsx('mt-3', 'text-lg', 'text-slate-600')}>{page.description}</p>
            ) : null}
        </header>
    );
}
