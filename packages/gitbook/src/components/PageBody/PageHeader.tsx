import type { GitBookSiteContext } from '@/lib/context';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { type RevisionPageDocument, SiteVisibility } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import urlJoin from 'url-join';
import { getPDFURLSearchParams } from '../PDF';
import {
    PageActionsDropdown,
    type PageActionsDropdownURLs,
} from '../PageActions/PageActionsDropdown';
import { PageIcon } from '../PageIcon';
import { StyledLink } from '../primitives';

export async function PageHeader(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
}) {
    const { context, page, ancestors } = props;
    const { revision, linker } = context;

    if (!page.layout.title && !page.layout.description) {
        return null;
    }

    const hasAncestors = ancestors.length > 0;

    return (
        <header
            className={tcls(
                'max-w-3xl',
                'page-width-wide:max-w-screen-2xl',
                'mx-auto',
                'mb-6',
                'space-y-3',
                'page-api-block:ml-0',
                'page-api-block:max-w-full',
                hasAncestors ? 'page-has-ancestors' : 'page-no-ancestors'
            )}
        >
            {page.layout.tableOfContents ? (
                // Show page actions if *any* of the actions are enabled
                <PageActionsDropdown
                    siteTitle={context.site.title}
                    urls={getPageActionsURLs(context, page)}
                    actions={context.customization.pageActions}
                    className={tcls(
                        'float-right ml-4 xl:max-2xl:page-api-block:mr-62',
                        hasAncestors ? '-my-1.5' : '-mt-3 xs:mt-2'
                    )}
                />
            ) : null}

            {hasAncestors && (
                <nav aria-label="Breadcrumb">
                    <ol className={tcls('flex', 'flex-wrap', 'items-center', 'gap-2', 'text-tint')}>
                        {ancestors.map((breadcrumb, index) => {
                            const href = linker.toPathForPage({
                                pages: revision.pages,
                                page: breadcrumb,
                            });
                            return (
                                <li key={breadcrumb.id} className="flex items-center gap-2">
                                    <StyledLink
                                        href={href}
                                        className={tcls(
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
                                    {index !== ancestors.length - 1 && (
                                        <Icon
                                            aria-hidden
                                            icon="chevron-right"
                                            className="size-3 text-tint-subtle"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            )}
            {page.layout.title ? (
                <h1
                    className={tcls(
                        'text-4xl',
                        'font-bold',
                        'flex',
                        'items-center',
                        'gap-4',
                        'grow',
                        'text-pretty',
                        'clear-right',
                        'xs:clear-none'
                    )}
                >
                    <PageIcon page={page} style={['text-tint-subtle ', 'shrink-0']} />
                    {page.title}
                </h1>
            ) : null}
            {page.description && page.layout.description ? (
                <p className={tcls('text-lg', 'text-tint', 'clear-both')}>{page.description}</p>
            ) : null}
        </header>
    );
}

/**
 * Return the URLs for the page actions.
 */
function getPageActionsURLs(
    context: GitBookSiteContext,
    page: RevisionPageDocument
): PageActionsDropdownURLs {
    return {
        html: context.linker.toAbsoluteURL(
            context.linker.toPathForPage({ pages: context.revision.pages, page })
        ),
        markdown: `${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md`,
        editOnGit:
            context.customization.git.showEditLink && context.space.gitSync?.url && page.git
                ? {
                      provider: context.space?.gitSync?.installationProvider,
                      url: urlJoin(context.space.gitSync.url, page.git.path),
                  }
                : undefined,
        pdf: context.customization.pdf.enabled
            ? context.linker.toPathInSpace(
                  `~gitbook/pdf?${getPDFURLSearchParams({
                      page: page.id,
                      only: true,
                      limit: 100,
                  }).toString()}`
              )
            : undefined,
        mcp:
            context.site.visibility !== SiteVisibility.VisitorAuth
                ? context.linker.toAbsoluteURL(context.linker.toPathInSpace('~gitbook/mcp'))
                : undefined,
    };
}
