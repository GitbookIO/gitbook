import { RevisionPageDocument } from '@gitbook/api';

import { Emoji } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

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
                <h1 className={tcls('text-4xl', 'font-bold')}>
                    {page.emoji ? <Emoji code={page.emoji} style={['mr-3']} /> : null}
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
