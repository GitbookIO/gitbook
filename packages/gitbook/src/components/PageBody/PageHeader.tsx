import type { GitBookSiteContext } from '@/lib/context';
import type { AncestorRevisionPage } from '@/lib/pages';
import { getLocalizedTitle, getSectionURL, getSiteSpaceURL } from '@/lib/sites';
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
import { getPDFURLSearchParams } from '../PDF';
import {
    PageActionsDropdown,
    type PageActionsDropdownURLs,
} from '../PageActions/PageActionsDropdown';
import { PageAsideToggleButton } from '../PageAside/PageAsideButton';
import { PageIcon } from '../PageIcon';
import { CONTENT_STYLE, CONTENT_STYLE_REDUCED } from '../layout';
import { BreadcrumbItemDropdown, type BreadcrumbSibling } from './BreadcrumbItemDropdown';
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

    // Surface where the page lives in the site at the start of the breadcrumbs: the section (with
    // its enclosing section groups) and the variant. When there are page breadcrumbs, these are
    // collapsed behind a "…" that expands on hover; otherwise they're shown inline. Each crumb also
    // carries its siblings, so hovering it reveals a dropdown to switch to them.
    const currentSection = context.sections?.current ?? null;
    // Variants to offer, falling back to all site spaces only when none are visible. Only surface
    // the variant crumb when there's more than one to switch between — otherwise it's just noise.
    const variantSpaces =
        context.visibleSiteSpaces.length > 0 ? context.visibleSiteSpaces : context.siteSpaces;
    const currentSiteSpace = variantSpaces.length > 1 ? context.siteSpace : null;
    const contextCrumbs: BreadcrumbContextCrumb[] = [];
    if (currentSection) {
        // Walk from the root down to the current section, adding a crumb for each enclosing section
        // group (non-navigable) and then the section itself. Prefer the visibility-filtered list for
        // the sibling dropdowns, but fall back to the full list if the current section was filtered
        // out of it (e.g. all its variants are hidden) so its crumb still renders.
        const visibleSections = context.visibleSections ?? context.sections;
        let chain = visibleSections
            ? findSectionChain(visibleSections.list, currentSection.id)
            : [];
        if (chain.length === 0 && context.sections && context.sections !== visibleSections) {
            chain = findSectionChain(context.sections.list, currentSection.id);
        }
        for (const { node, siblings } of chain) {
            contextCrumbs.push({
                key: `section-${node.id}`,
                // Section groups have no URL of their own; only sections are navigable.
                href: node.object === 'site-section' ? getSectionURL(context, node) : undefined,
                label: getLocalizedTitle(node, context.locale),
                icon: node.icon,
                siblings: siblings
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
            siblings: variantSpaces.map((siteSpace) => ({
                id: siteSpace.id,
                title: getLocalizedTitle(siteSpace, context.locale),
                href: getSiteSpaceURL(context, siteSpace),
                isActive: siteSpace.id === currentSiteSpace.id,
            })),
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

    return (
        <header className={tcls(CONTENT_STYLE, 'mb-6 space-y-3 after:clear-both after:block')}>
            <div
                className={tcls(
                    'float-right ml-4 flex gap-2',
                    showBreadcrumbs ? '-my-0.5' : '-mt-3 xs:mt-2'
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

            {showBreadcrumbs && (
                <nav aria-label="Breadcrumb" className="text-tint text-xs leading-snug">
                    <ol className="inline">
                        {hasContextCrumbs &&
                            (hasAncestors && contextCrumbs.length > 1 ? (
                                // With page breadcrumbs and both a section & variant to show, collapse
                                // them behind a "…" that expands when hovered. A single item isn't
                                // worth hiding, so it's shown inline (below) instead.
                                <li className="inline">
                                    <span
                                        className={tcls(
                                            'group/breadcrumb-context inline',
                                            // Keep the "…" collapsed while a dropdown is open (matches the reveal).
                                            'has-[*[data-state=open]]:[&>svg]:w-0 has-[*[data-state=open]]:[&>svg]:opacity-0 has-[*[data-state=open]]:[&>svg]:blur-[2px]'
                                        )}
                                    >
                                        {/* The crumbs come first in the flow so their left edge stays
                                            fixed as they fade in/out — only the trailing "…" moves. */}
                                        <span
                                            className={tcls(
                                                'invisible inline-flex w-0 items-center overflow-hidden whitespace-nowrap align-bottom opacity-0 blur-[2px]',
                                                'group-hover/breadcrumb-context:visible group-hover/breadcrumb-context:w-auto group-hover/breadcrumb-context:opacity-100 group-hover/breadcrumb-context:blur-[0px]',
                                                // Stay open while one of the items' dropdowns is open (its trigger
                                                // carries Radix's `data-state="open"`), so the pointer can move into
                                                // the portalled menu without collapsing the reveal.
                                                'has-[*[data-state=open]]:visible has-[*[data-state=open]]:w-auto has-[*[data-state=open]]:opacity-100 has-[*[data-state=open]]:blur-[0px]',
                                                'transition-[visibility,width,opacity,filter] duration-200 motion-reduce:transition-none'
                                            )}
                                        >
                                            {contextCrumbs.map((crumb, index) => (
                                                <span
                                                    key={crumb.key}
                                                    className="inline-flex items-center"
                                                >
                                                    <ContextCrumb crumb={crumb} />
                                                    {index !== contextCrumbs.length - 1 && (
                                                        <BreadcrumbSeparator />
                                                    )}
                                                </span>
                                            ))}
                                        </span>
                                        <Icon
                                            aria-hidden
                                            icon="ellipsis-h"
                                            className={tcls(
                                                'inline-block size-[1em] shrink-0 overflow-hidden align-text-bottom text-tint-subtle blur-[0px]',
                                                'group-hover/breadcrumb-context:w-0 group-hover/breadcrumb-context:opacity-0 group-hover/breadcrumb-context:blur-[2px]',
                                                'transition-[width,opacity,filter] duration-200 motion-reduce:transition-none'
                                            )}
                                        />
                                    </span>
                                    <BreadcrumbSeparator />
                                </li>
                            ) : (
                                // Otherwise show the section/variant inline — either there are no page
                                // breadcrumbs, or there's only one of them (not worth a "…").
                                contextCrumbs.map((crumb, index) => (
                                    <li key={crumb.key} className="inline">
                                        <ContextCrumb crumb={crumb} />
                                        {(index !== contextCrumbs.length - 1 || hasAncestors) && (
                                            <BreadcrumbSeparator />
                                        )}
                                    </li>
                                ))
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
        />
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
 */
function getSectionNodeURL(context: GitBookSiteContext, node: SectionNode): string | undefined {
    const section = findFirstSection(node);
    return section ? getSectionURL(context, section) : undefined;
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
