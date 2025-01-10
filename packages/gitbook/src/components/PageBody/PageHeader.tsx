import { RevisionPage, RevisionPageDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { headers } from 'next/headers';
import { Fragment } from 'react';

import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getPageHref } from '@/lib/links';
import { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';
import { StyledLink } from '../primitives';

export async function PageHeader(props: {
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    pages: RevisionPage[];
}) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { page, ancestors, pages } = props;

    if (!page.layout.title && !page.layout.description) {
        return null;
    }

    const ancestorElements = await Promise.all(
        ancestors.map(async (breadcrumb, index) => {
            const href = await getPageHref(ctx, pages, breadcrumb);
            return (
                <Fragment key={breadcrumb.id}>
                    <li key={breadcrumb.id}>
                        <StyledLink
                            href={href}
                            style={tcls(
                                'no-underline',
                                'hover:underline',
                                'text-xs',
                                'tracking-wide',
                                'font-semibold',
                                'uppercase',
                                'flex',
                                'items-center',
                                'gap-1',
                            )}
                        >
                            <PageIcon
                                page={breadcrumb}
                                style={tcls('size-4', 'text-base', 'leading-none')}
                            />
                            {breadcrumb.title}
                        </StyledLink>
                    </li>
                    {index != ancestors.length - 1 && (
                        <Icon
                            icon="chevron-right"
                            className={tcls('size-3', 'text-light-4', 'dark:text-dark-4')}
                        />
                    )}
                </Fragment>
            );
        }),
    );

    return (
        <header
            className={tcls('max-w-3xl', 'mx-auto', 'mb-6', 'space-y-3', 'page-api-block:ml-0')}
        >
            {ancestors.length > 0 && (
                <nav>
                    <ol className={tcls('flex', 'flex-wrap', 'items-center', 'gap-2')}>
                        {ancestorElements}
                    </ol>
                </nav>
            )}
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
