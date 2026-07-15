import type { GitBookSiteContext } from '@/lib/context';
import { type AncestorRevisionPage, resolveFirstDocument } from '@/lib/pages';
import { getLocalizedTitle, getSiteSpaceURL } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';
import { getPageRSSURL } from '@/routes/rss';
import {
    CustomizationPageActionType,
    type RevisionPage,
    type RevisionPageDocument,
    type SiteSection,
    type SiteSectionGroup,
    SiteVisibility,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import urlJoin from 'url-join';
import { SpacesDropdownMenuItems, type VariantSpace } from '../Header/SpacesDropdownMenuItem';
import { getPDFURLSearchParams } from '../PDF';
import {
    PageActionsDropdown,
    type PageActionsDropdownURLs,
} from '../PageActions/PageActionsDropdown';
import { PageAsideToggleButton } from '../PageAside/PageAsideButton';
import { PageIcon } from '../PageIcon';
import { findBestTargetURL } from '../SiteSections/encodeClientSiteSections';
import { categorizeVariants } from '../SpaceLayout/categorizeVariants';
import { CONTENT_STYLE, CONTENT_STYLE_REDUCED } from '../layout';
import { BreadcrumbItemDropdown, type BreadcrumbSibling } from './BreadcrumbItemDropdown';
import { PageTags } from './PageTags';

export async function PageHeader(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    withRSSFeed: boolean;
    /**
     * Whether the page has OpenAPI/Swagger blocks. On desktop, such pages get the page-actions
     * pinned below the site header (see the render below); everywhere else the header is left
     * exactly as-is.
     */
    hasAPIBlocks: boolean;
}) {
    const { context, page, ancestors, withRSSFeed, hasAPIBlocks } = props;
    const { revision, linker } = context;

    const hasAncestors = ancestors.length > 0;

    // Surface where the page lives in the site at the start of the breadcrumbs: the section (with
    // its enclosing section groups) and the variant. Each crumb also carries its siblings, so
    // hovering it reveals a dropdown to switch to them.
    // Only surface section crumbs when the site actually has more than one section to switch between
    // (mirroring the section tabs). A single-space site has one section named after the site, which
    // is not a meaningful breadcrumb.
    const hasMultipleSections = Boolean(
        context.visibleSections && context.visibleSections.list.length > 1
    );
    const currentSection = hasMultipleSections ? (context.sections?.current ?? null) : null;
    // Variants to offer as a crumb: only the "generic" variants (versions, etc.). Language variants
    // are excluded — they belong to the dedicated language picker — using the same split it uses.
    // Only surface the variant crumb when there's more than one to switch between.
    const variantSpaces = categorizeVariants(context).generic;
    const currentSiteSpace = variantSpaces.length > 1 ? context.siteSpace : null;
    const contextCrumbs: BreadcrumbContextCrumb[] = [];
    if (currentSection) {
        // Walk the full section tree so the current section (and its enclosing groups) always shows
        // as a crumb, even when it's hidden in the site structure. Only *visible* sections/groups
        // are offered as siblings to switch to, though.
        const chain = context.sections
            ? findSectionChain(context.sections.list, currentSection.id)
            : [];
        const visibleSectionIds = context.visibleSections
            ? collectSectionNodeIds(context.visibleSections.list)
            : null;
        for (const { node, siblings } of chain) {
            contextCrumbs.push({
                key: `section-${node.id}`,
                // Section groups have no URL of their own; only sections are navigable. Resolve the
                // section to the site space matching the current variant so switching sections keeps
                // the reader on their current variant (same logic as the section tabs).
                href: node.object === 'site-section' ? findBestTargetURL(context, node) : undefined,
                label: getLocalizedTitle(node, context.locale),
                icon: node.icon,
                siblings: siblings
                    // Don't offer hidden sections/groups as switch targets.
                    .filter((sibling) => !visibleSectionIds || visibleSectionIds.has(sibling.id))
                    .map((sibling) => {
                        const href = getSectionNodeURL(context, sibling);
                        // Keep siblings whose URL is "" (the site's first page); only drop the ones
                        // with no resolvable URL at all.
                        return href !== undefined
                            ? {
                                  id: sibling.id,
                                  title: getLocalizedTitle(sibling, context.locale),
                                  href,
                                  icon: sibling.icon,
                                  isActive: sibling.id === node.id,
                              }
                            : null;
                    })
                    .filter((sibling) => sibling !== null),
            });
        }
    }
    if (currentSiteSpace) {
        contextCrumbs.push({
            key: `variant-${currentSiteSpace.id}`,
            href: getSiteSpaceURL(context, currentSiteSpace),
            label: getLocalizedTitle(currentSiteSpace, context.locale),
            siblings: [],
            // Reuse the header's variant switcher rather than plain per-variant links, so each entry
            // resolves to the current page in the target variant (via per-page alternates) instead
            // of that variant's landing page.
            variantSwitcher: {
                slimSpaces: variantSpaces.map((siteSpace) => ({
                    id: siteSpace.id,
                    title: getLocalizedTitle(siteSpace, context.locale),
                    url: getSiteSpaceURL(context, siteSpace),
                    isActive: siteSpace.id === currentSiteSpace.id,
                    spaceId: siteSpace.space.id,
                })),
                curPath: currentSiteSpace.path,
            },
        });
    }
    const hasContextCrumbs = contextCrumbs.length > 0;
    const showBreadcrumbs = hasAncestors || hasContextCrumbs;

    const pageActionsEnabled = page.layout.actions !== false;

    // Show page actions if *any* of the configured actions are enabled, or if the RSS feed is
    // available. RSS is contextual (only on update/blog index pages) and is not part of the
    // configured `items` list, so it is checked separately.
    const hasConfiguredPageActions = [
        CustomizationPageActionType.Assistant,
        CustomizationPageActionType.ExternalAi,
        CustomizationPageActionType.Markdown,
        CustomizationPageActionType.Mcp,
        CustomizationPageActionType.Pdf,
        CustomizationPageActionType.Git,
    ].some((type) => isPageActionEnabled(context.customization, type));
    const hasPageActions = pageActionsEnabled && (hasConfiguredPageActions || withRSSFeed);

    if (!page.layout.title && !page.layout.description && !hasPageActions) {
        return null;
    }

    const pageActions = (
        <div
            className={tcls(
                'float-right ml-4 flex gap-2',
                showBreadcrumbs ? '-mb-1 -mt-1.5' : '-mt-3 xs:mt-2',
                // On desktop API pages (where this <div> is rendered as a sibling of <header>, see
                // below) keep the actions pinned below the site header while scrolling long
                // operations. The offset tracks the header height (banner, cover…) via the same
                // --toc-top-offset the outline and code samples use. Hidden while the outline drawer
                // is open (drawer widths only) so it doesn't overlap the sheet.
                hasAPIBlocks && [
                    'page-api-block:lg:sticky',
                    'page-api-block:lg:top-[calc(var(--toc-top-offset,4rem)+1rem)]',
                    'page-api-block:lg:z-20',
                    'lg:max-[96rem]:[body.outline-open:has(.openapi-block)_&]:hidden',
                    // On a full-page-cover page <main> is a flex column, where `float-right` is
                    // inert; align to the end so the actions still sit on the right. Harmless
                    // (align-self has no effect) on the usual block layout, where the float wins.
                    'self-end',
                ]
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
    );

    const headerContent = (
        <>
            {showBreadcrumbs && (
                // Hide the breadcrumbs on wide pages that have no table of contents: there the
                // content spans the full width with no navigation column, so the crumbs sit stranded.
                <nav
                    aria-label="Breadcrumb"
                    className="layout-wide:page-no-toc:hidden page-cover-background:text-contrast-cover text-tint text-xs leading-relaxed page-cover-background:opacity-9"
                >
                    <ol className="inline">
                        {contextCrumbs.map((crumb, index) => (
                            <li key={crumb.key} className="inline">
                                <ContextCrumb crumb={crumb} />
                                {(index !== contextCrumbs.length - 1 || hasAncestors) && (
                                    <BreadcrumbSeparator />
                                )}
                            </li>
                        ))}
                        {ancestors.map((breadcrumb, index) => {
                            const parentPages = ancestors[index - 1]?.pages ?? revision.pages;
                            const href = linker.toPathForPage({
                                pages: revision.pages,
                                page: breadcrumb,
                            });
                            return (
                                <li key={breadcrumb.id} className="inline">
                                    <BreadcrumbItemDropdown
                                        href={href}
                                        label={breadcrumb.title}
                                        emoji={breadcrumb.emoji}
                                        icon={breadcrumb.icon}
                                        linkClassName={BREADCRUMB_LINK_CLASSES}
                                        siblings={getPageSiblings(
                                            context,
                                            parentPages,
                                            breadcrumb.id
                                        )}
                                    />
                                    {index !== ancestors.length - 1 && <BreadcrumbSeparator />}
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
                        'xs:clear-none',
                        'page-cover-background:text-contrast-cover'
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
                        'page-cover-background:text-contrast-cover',
                        'text-tint contrast-more:text-tint-strong',
                        'clear-both'
                    )}
                >
                    {page.description}
                </p>
            ) : null}
        </>
    );

    const headerClassName = tcls(CONTENT_STYLE, 'mb-6 space-y-3 after:clear-both after:block');

    // On API pages the actions are pulled out of <header> so their sticky containing block is the
    // full-height <main> rather than the short header (a sticky element can't outlive its containing
    // block). Everywhere else they stay inside <header> exactly as before, so those pages render
    // byte-for-byte identically.
    return hasAPIBlocks ? (
        <>
            {pageActions}
            <header className={headerClassName}>{headerContent}</header>
        </>
    ) : (
        <header className={headerClassName}>
            {pageActions}
            {headerContent}
        </header>
    );
}

/**
 * Shared styling for the individual breadcrumb links. Uses normal casing/weight to match the way
 * breadcrumbs are rendered in search results.
 */
const BREADCRUMB_LINK_CLASSES = [
    'inline',
    'no-underline',
    'hover:underline',
    'text-xs',
    'font-normal',
    'items-center',
    'contrast-more:underline',
    'contrast-more:decoration-current',
];

/** A section-group, section or variant crumb shown at the start of the breadcrumbs. */
type BreadcrumbContextCrumb = {
    key: string;
    href?: string;
    label: string;
    // Sections, section groups and variants only ever carry an icon, never an emoji.
    icon?: string;
    siblings: BreadcrumbSibling[];
    /**
     * Present only for the variant crumb: the header's variant switcher data, whose dropdown entries
     * resolve to the current page in each variant. Rendered instead of `siblings`.
     */
    variantSwitcher?: { slimSpaces: VariantSpace[]; curPath: string };
};

/** Render a context crumb (section group / section / variant) with its sibling dropdown. */
function ContextCrumb({ crumb }: { crumb: BreadcrumbContextCrumb }) {
    return (
        <BreadcrumbItemDropdown
            href={crumb.href}
            label={crumb.label}
            icon={crumb.icon}
            linkClassName={BREADCRUMB_LINK_CLASSES}
            siblings={crumb.siblings}
        >
            {crumb.variantSwitcher ? (
                <SpacesDropdownMenuItems
                    slimSpaces={crumb.variantSwitcher.slimSpaces}
                    curPath={crumb.variantSwitcher.curPath}
                />
            ) : undefined}
        </BreadcrumbItemDropdown>
    );
}

type SectionNode = SiteSection | SiteSectionGroup;

/**
 * Walk the section tree from the root down to the section with the given id, returning one entry per
 * level (each enclosing section group, then the section) along with that level's siblings. Returns
 * an empty array if the section isn't found.
 */
function findSectionChain(
    list: SectionNode[],
    sectionId: string
): Array<{ node: SectionNode; siblings: SectionNode[] }> {
    for (const item of list) {
        if (item.object === 'site-section') {
            if (item.id === sectionId) {
                return [{ node: item, siblings: list }];
            }
        } else {
            const nested = findSectionChain(item.children, sectionId);
            if (nested.length > 0) {
                return [{ node: item, siblings: list }, ...nested];
            }
        }
    }
    return [];
}

/**
 * The first navigable section within a node — the node itself if it's a section, otherwise the first
 * section found in its (possibly nested) children.
 */
function findFirstSection(node: SectionNode): SiteSection | null {
    if (node.object === 'site-section') {
        return node;
    }
    for (const child of node.children) {
        const found = findFirstSection(child);
        if (found) {
            return found;
        }
    }
    return null;
}

/**
 * Resolve a section-tree node to a navigable URL. Sections use their own URL; section groups (which
 * have none of their own) fall back to their first section, so they stay navigable in a dropdown.
 * The URL resolves to the site space matching the current variant (same logic as the section tabs),
 * so switching sections keeps the reader on their current variant.
 */
function getSectionNodeURL(context: GitBookSiteContext, node: SectionNode): string | undefined {
    const section = findFirstSection(node);
    return section ? findBestTargetURL(context, section) : undefined;
}

/** Collect the ids of every section and section group in a (visible) section tree. */
function collectSectionNodeIds(list: SectionNode[]): Set<string> {
    const ids = new Set<string>();
    const walk = (nodes: SectionNode[]) => {
        for (const node of nodes) {
            ids.add(node.id);
            if (node.object === 'site-section-group') {
                walk(node.children);
            }
        }
    };
    walk(list);
    return ids;
}

/**
 * Build the sibling list for a page-level breadcrumb item, from the children of its parent.
 * Only pages with a resolvable path (documents & groups) are navigable, so links and computed pages
 * are skipped, as are hidden pages — except the active page itself, so its own crumb stays marked.
 */
function getPageSiblings(
    context: GitBookSiteContext,
    siblings: RevisionPage[],
    activeId: string
): BreadcrumbSibling[] {
    const result: BreadcrumbSibling[] = [];
    for (const page of siblings) {
        if (page.type !== 'document' && page.type !== 'group') {
            continue;
        }
        if (page.hidden && page.id !== activeId) {
            continue;
        }
        // A group whose subtree has no document resolves to no page — the sidebar renders it as a
        // non-clickable label, so don't offer it as a navigable sibling (its path would 404).
        if (page.type === 'group' && page.id !== activeId && !resolveFirstDocument([page], [])) {
            continue;
        }
        result.push({
            id: page.id,
            title: page.linkTitle || page.title,
            href: context.linker.toPathForPage({ pages: context.revision.pages, page }),
            emoji: page.emoji,
            icon: page.icon,
            isActive: page.id === activeId,
        });
    }
    return result;
}

/**
 * Separator rendered between two breadcrumb items.
 */
function BreadcrumbSeparator() {
    return (
        <Icon
            aria-hidden
            icon="chevron-right"
            className="mx-2 inline-flex size-2 text-tint-subtle"
        />
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
            isPageActionEnabled(context.customization, CustomizationPageActionType.Git) &&
            context.space.gitSync?.url &&
            page.git
                ? {
                      provider: context.space?.gitSync?.installationProvider,
                      url: urlJoin(context.space.gitSync.url, page.git.path),
                  }
                : undefined,
        pdf: isPageActionEnabled(context.customization, CustomizationPageActionType.Pdf)
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
 * Whether a given built-in page action is enabled.
 */
function isPageActionEnabled(
    customization: GitBookSiteContext['customization'],
    type: CustomizationPageActionType
): boolean {
    const { pageActions } = customization;
    if (pageActions.items) {
        return pageActions.items.includes(type);
    }
    return false;
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
