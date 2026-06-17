import type { GitBookSiteContext } from '@/lib/context';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { getPageRSSURL } from '@/routes/rss';
import { CustomizationAIMode, type RevisionPageDocument, SiteVisibility } from '@gitbook/api';
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

    const pageActionsEnabled = page.layout.actions !== false;

    // Show page actions if *any* of the actions are enabled
    const hasPageActions =
        pageActionsEnabled &&
        [
            context.customization.ai.mode === CustomizationAIMode.Assistant,
            context.customization.pageActions.externalAI,
            context.customization.pageActions.markdown,
            context.customization.pageActions.mcp,
            context.customization.pdf.enabled,
            context.customization.git.showEditLink,
            withRSSFeed,
        ].some(Boolean);

    if (!page.layout.title && !page.layout.description && !hasPageActions) {
        return null;
    }

    return (
        <>
            {/* Page actions (assistant, "On this page", ...). Rendered as a sibling of the
            <header> — i.e. a direct child of the scrolling <main> — so that on larger screens
            it can stick to the top of the viewport while the page is scrolled. If it lived
            inside the <header>, its sticky containing block would be the short header and it
            would scroll away with it. */}
            <div
                className={tcls(
                    'float-right ml-4 flex gap-2',
                    hasAncestors ? '-my-0.5' : '-mt-3 xs:mt-2',

                    // Stick to the top of the viewport on non-mobile viewports so the actions
                    // remain reachable while reading long pages (e.g. API references).
                    'lg:sticky lg:z-20',

                    // When the "On this page" panel is expanded as an overlay, drop below it
                    // so the sticky actions don't show on top of the open panel.
                    'lg:[body.outline-open_&]:z-0',

                    // Server-side static positioning, padded slightly below the site header
                    // (unlike the TOC/outline, which sit flush against it).
                    'lg:top-3',
                    'lg:site-header:top-[4.75rem]',
                    'lg:site-header-sections:top-[7.5rem]',

                    // Client-side dynamic positioning (CSS var applied by TableOfContentsScript),
                    // kept consistent with the outline so both account for headers/banners/covers.
                    'lg:[html[style*="--outline-top-offset"]_&]:top-[calc(var(--outline-top-offset)+0.75rem)]!'
                )}
            >
                {hasPageActions ? (
                    <PageActionsDropdown
                        siteTitle={context.site.title}
                        urls={getPageActionsURLs({ context, page, withRSSFeed })}
                        actions={context.customization.pageActions}
                        page={{
                            id: page.id,
                            title: page.title,
                            path: page.path,
                            href: linker.toPathForPage({ pages: revision.pages, page }),
                        }}
                    />
                ) : null}
                <PageAsideToggleButton />
            </div>

            <header className={tcls(CONTENT_STYLE, 'mb-6 space-y-3 after:clear-both after:block')}>
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
                    <p
                        className={tcls(
                            CONTENT_STYLE_REDUCED,
                            'text-lg',
                            'text-tint',
                            'clear-both'
                        )}
                    >
                        {page.description}
                    </p>
                ) : null}
            </header>
        </>
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
        mcp: getPageActionsMCPURL(context),
    };
}

/**
 * Return the MCP URL to be used in the page actions dropdown.
 */
function getPageActionsMCPURL(context: GitBookSiteContext) {
    const useAuthenticatedEndpoint = Boolean(
        context.site.visibility !== SiteVisibility.VisitorAuth &&
            context.site.adaptiveContent?.enabled &&
            context.site.urls.login &&
            context.isLoggedInVisitor
    );
    const endpoint = useAuthenticatedEndpoint ? '~gitbook/mcp/auth' : '~gitbook/mcp';

    return context.linker.toAbsoluteURL(context.linker.toPathInSite(endpoint));
}
