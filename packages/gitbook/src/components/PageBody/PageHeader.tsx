import { RevisionPage, RevisionPageDocument } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';

export function PageHeader(props: { page: RevisionPageDocument; pages: RevisionPage[] }) {
    const { page, pages } = props;

    if (!page.layout.title && !page.layout.description) {
        return null;
    }

    const pageGroup = pages.find(
        (item) => item.type == 'group' && item.path == page.path.match(/([^\/]+)/g)?.[0],
    );

    return (
        <header
            className={tcls('max-w-3xl', 'mx-auto', 'mb-6', 'space-y-3', 'page-api-block:ml-0')}
        >
            {page.layout.title ? (
                <>
                    {pageGroup && (
                        <p
                            className={tcls(
                                'text-xs',
                                'tracking-wide',
                                'font-semibold',
                                'uppercase',
                                'text-tint',
                                'flex',
                                'items-center',
                                'gap-2',
                            )}
                        >
                            <PageIcon
                                page={pageGroup}
                                style={tcls('size-4', 'text-base', 'leading-none')}
                            />
                            {/* {pageGroup.icon && <Icon icon={pageGroup.icon as IconName} className='size-4' />}
                            {pageGroup.emoji && <span className='size-4'><Emoji code={pageGroup.emoji}> /></span>} */}
                            {pageGroup.title}
                        </p>
                    )}
                    <h1 className={tcls('text-4xl', 'font-bold', 'flex', 'items-center', 'gap-4')}>
                        <PageIcon page={page} style={['text-dark/6', 'dark:text-light/6']} />
                        {page.title}
                    </h1>
                </>
            ) : null}
            {page.description && page.layout.description ? (
                <p className={tcls('text-lg', 'text-dark-4', 'dark:text-light-4')}>
                    {page.description}
                </p>
            ) : null}
        </header>
    );
}
