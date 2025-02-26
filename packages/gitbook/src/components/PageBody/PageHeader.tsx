import type { RevisionPageDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { Fragment } from 'react';

import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import type { GitBookSiteContext } from '@v2/lib/context';

import { PageIcon } from '../PageIcon';
import { StyledLink } from '../primitives';

export async function PageHeader(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
}) {
    const { context, page, ancestors } = props;
    const { pages, linker } = context;

    if (!page.layout.title && !page.layout.description) {
        return null;
    }

    return (
        <header
            className={tcls('max-w-3xl', 'mx-auto', 'mb-6', 'space-y-3', 'page-api-block:ml-0')}
        >
            {ancestors.length > 0 && (
                <nav>
                    <ol className={tcls('flex', 'flex-wrap', 'items-center', 'gap-2')}>
                        {ancestors.map((breadcrumb, index) => {
                            const href = linker.toPathForPage({ pages, page: breadcrumb });
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
                                                'gap-1.5',
                                                'contrast-more:underline',
                                                'contrast-more:decoration-current'
                                            )}
                                        >
                                            <PageIcon
                                                page={breadcrumb}
                                                style="flex size-4 items-center justify-center text-base leading-none"
                                            />
                                            {breadcrumb.title}
                                        </StyledLink>
                                    </li>
                                    {index !== ancestors.length - 1 && (
                                        <Icon
                                            icon="chevron-right"
                                            className={tcls('size-3', 'text-tint-subtle')}
                                        />
                                    )}
                                </Fragment>
                            );
                        })}
                    </ol>
                </nav>
            )}
            {page.layout.title ? (
                <h1 className={tcls('text-4xl', 'font-bold', 'flex', 'items-center', 'gap-4')}>
                    <PageIcon page={page} style={['text-tint-subtle ', 'shrink-0']} />
                    {page.title}
                </h1>
            ) : null}
            {page.description && page.layout.description ? (
                <p className={tcls('text-lg', 'text-tint')}>{page.description}</p>
            ) : null}
        </header>
    );
}
