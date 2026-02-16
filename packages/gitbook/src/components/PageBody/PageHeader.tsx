import type { GitBookSiteContext } from '@/lib/context';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { getPageRSSURL } from '@/routes/rss';
import { type RevisionPageDocument, SiteVisibility } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import urlJoin from 'url-join';
import { getPDFURLSearchParams } from '../PDF';
import {
    PageActionsDropdown,
    type PageActionsDropdownURLs,
} from '../PageActions/PageActionsDropdown';
import { PageIcon } from '../PageIcon';
import { CONTENT_LAYOUT } from '../layout';
import { StyledLink } from '../primitives';

export async function PageHeader(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    withRSSFeed: boolean;
}) {
    const { context, page, ancestors, withRSSFeed } = props;
    const { revision, linker } = context;

    const hasAncestors = ancestors.length > 0;

    // Show page actions if *any* of the actions are enabled
    const hasPageActions = [
        ...Object.values(context.customization.pageActions),
        context.customization.pdf.enabled,
        context.customization.git.showEditLink,
        withRSSFeed,
    ].some(Boolean);

    // When title and description are hidden,
    // only display the page actions if the page contains an update block.
    if (!page.layout.title && !page.layout.description) {
        if (!hasPageActions) {
            return null;
        }

        return (
            <PageActionsDropdown
                siteTitle={context.site.title}
                urls={getPageActionsURLs({ context, page, withRSSFeed })}
                actions={context.customization.pageActions}
                className="absolute top-8 right-0 page-updates-block:flex hidden"
            />
        );
    }

    return (
        <header
            className={tcls(
                CONTENT_LAYOUT,
                'mb-6',
                'space-y-3',
                hasAncestors ? 'page-has-ancestors' : 'page-no-ancestors'
            )}
        >
            {hasPageActions ? (
                <PageActionsDropdown
                    siteTitle={context.site.title}
                    urls={getPageActionsURLs({ context, page, withRSSFeed })}
                    actions={context.customization.pageActions}
                    className={tcls('float-right ml-4', hasAncestors ? '-my-1.5' : '-mt-3 xs:mt-2')}
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
                        'text-2xl',
                        '@xs:text-3xl',
                        '@lg:text-4xl',
                        'leading-tight',
                        'font-bold',
                        'flex',
                        'items-center',
                        'gap-[.5em]',
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
function getPageActionsURLs({
    context,
    page,
    withRSSFeed,
}: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    withRSSFeed: boolean;
}): PageActionsDropdownURLs {
    const pagePath = context.linker.toPathForPage({ pages: context.revision.pages, page });
    return {
        html: context.linker.toAbsoluteURL(pagePath),
        // For the markdown URL, we use the page.path to ensure it works for the default page.
        markdown: `${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md`,
        rss: withRSSFeed ? getPageRSSURL(context, page) : undefined,
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
