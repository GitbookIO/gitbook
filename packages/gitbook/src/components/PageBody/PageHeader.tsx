import { RevisionPageDocument } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import { PageIcon } from '../PageIcon';

export function PageHeader(props: { page: RevisionPageDocument }) {
    const { page } = props;

    if (!page.layout.title && !page.layout.description) {
        return null;
    }

    return (
        <header
            className={tcls('max-w-3xl', 'mx-auto', 'mb-6', 'space-y-3', 'page-api-block:ml-0')}
        >
            {page.layout.title ? (
                <h1 className={tcls('text-4xl', 'font-bold', 'flex', 'items-center', 'gap-4')}>
                    <PageIcon page={page} style={['text-dark/6', 'dark:text-light/6']} />
                    {page.title}
                </h1>
            ) : null}
            {page.description && page.layout.description ? (
                <p className={tcls('text-lg', 'text-dark-4', 'dark:text-light-4')}>
                    {page.description}
                </p>
            ) : null}
        </header>
    );
}
