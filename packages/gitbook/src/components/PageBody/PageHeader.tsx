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
import { PageAsideToggleButton } from '../PageAside/PageAsideButton';
import { PageIcon } from '../PageIcon';
import { CONTENT_STYLE, CONTENT_STYLE_REDUCED } from '../layout';
import { StyledLink } from '../primitives';
import { PageTags } from './PageTags';

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

    if (!page.layout.title && !page.layout.description && !hasPageActions) {
        return null;
    }

    return (
        <header className={tcls(CONTENT_STYLE, 'mb-6', 'space-y-3')}>
            <div
                className={tcls(
                    'float-right ml-4 flex gap-2',
                    hasAncestors ? '-my-0.5' : '-mt-3 xs:mt-2'
                )}
            >
                {hasPageActions ? (
                    <PageActionsDropdown
                        siteTitle={context.site.title}
                        urls={getPageActionsURLs({ context, page, withRSSFeed })}
                        actions={context.customization.pageActions}
                    />
                ) : null}
                <PageAsideToggleButton />
            </div>

            {hasAncestors && (
                <nav aria-label="Breadcrumb" className="text-tint leading-snug">
                    <ol className="inline">
                        {ancestors.map((breadcrumb, index) => {
                            const href = linker.toPathForPage({
                                pages: revision.pages,
                                page: breadcrumb,
                            });
                            return (
                                <li key={breadcrumb.id} className="inline">
                                    <StyledLink
                                        href={href}
                                        className={tcls(
                                            'inline',
                                            'no-underline',
                                            'hover:underline',
                                            'text-xs',
                                            'tracking-wide',
                                            'font-semibold',
                                            'uppercase',
                                            'items-center',
                                            'contrast-more:underline',
                                            'contrast-more:decoration-current'
                                        )}
                                    >
                                        <PageIcon
                                            page={breadcrumb}
                                            style="mr-1 inline size-3.5 shrink-0"
                                        />
                                        {breadcrumb.title}
                                    </StyledLink>
                                    {index !== ancestors.length - 1 && (
                                        <Icon
                                            aria-hidden
                                            icon="chevron-right"
                                            className="mx-2 inline-flex size-2 text-tint-subtle"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            )}
            <PageTags page={page} revision={revision} />
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
                <p className={tcls(CONTENT_STYLE_REDUCED, 'text-lg', 'text-tint', 'clear-both')}>
                    {page.description}
                </p>
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
                ? context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/mcp'))
                : undefined,
    };
}
