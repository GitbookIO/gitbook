import { RevisionPageDocument } from '@gitbook/api';
import { tcls } from '@/lib/tailwind';

export function PageHeader(props: { page: RevisionPageDocument }) {
    const { page } = props;

    return (
        <header className={tcls('max-w-3xl')}>
            <h1 className={tcls('text-4xl', 'font-bold')}>{page.title}</h1>
            {page.description ? (
                <p className={tcls('mt-3', 'text-lg', 'text-slate-600')}>{page.description}</p>
            ) : null}
        </header>
    );
}
