import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull, getPageDocument } from '@/lib/data';
import {
    CustomizationHeaderPreset,
    CustomizationThemeMode,
    type RevisionPageDocument,
    SiteInsightsDisplayContext,
    type TranslationLanguage,
} from '@gitbook/api';
import type { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getPagePath } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';

import { getResizedImageURL } from '@/lib/images';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { getPageRSSURL } from '@/routes/rss';
import { PageContextProvider } from '../PageContext';
import { PageClientLayout } from './PageClientLayout';
import { type PagePathParams, fetchPageData, getPathnameParam } from './fetch';

export type SitePageProps = {
    context: GitBookSiteContext;
    pageParams: PagePathParams;
};

type AlternateLinkSpace = {
    id: string;
    language: TranslationLanguage | undefined;
};

export type PageMetaLinks = {
    /**
     * The canonical URL for the page, if any.
     */
    canonical: string | null;
    /**
     * The alternate URLs for the page, if any.
     */
    alternates: Array<{
        href: string;
        /**
         * Space the alternate link points to, if any.
         */
        space: AlternateLinkSpace | null;
    }>;
};

/**
 * Fetch and render a page.
 */
export async function SitePage(props: SitePageProps) {
    const {
        context,
        page,
        ancestors,
        document,
        withFullPageCover,
        withPageFeedback,
        withSections,
        withTopHeader,
        pageMetaLinks,
    } = await getSitePageData(props);
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    return (
        <PageContextProvider pageId={page.id} spaceId={context.space.id} title={page.title}>
            {/* Using `contents` makes the children of this div according to its parent — which keeps them in a single flex row with the TOC by default.
            If there's a page cover, we use `flex flex-col` to lay out the PageCover above the PageBody + PageAside instead. */}
            <div className={withFullPageCover && page.cover ? 'flex grow flex-col' : 'contents'}>
                {withFullPageCover && page.cover ? (
                    <PageCover as="full" page={page} cover={page.cover} context={context} />
                ) : null}

                <div
                    className={tcls(
                        withFullPageCover && page.cover ? 'flex grow flex-row' : 'contents',
                        withSections
                            ? '[--content-scroll-margin:calc(var(--spacing)*27)]'
                            : '[--content-scroll-margin:calc(var(--spacing)*16)]'
                    )}
                >
                    <PageAside
                        page={page}
                        document={document}
                        withHeaderOffset={headerOffset}
                        withFullPageCover={withFullPageCover}
                        withPageFeedback={withPageFeedback}
                        context={context}
                    />
                    <PageBody
                        context={context}
                        page={page}
                        ancestors={ancestors}
                        document={document}
                        withPageFeedback={withPageFeedback}
                        insightsDisplayContext={SiteInsightsDisplayContext.Site}
                    />
                </div>
                <PageClientLayout pageMetaLinks={pageMetaLinks} />
            </div>
        </PageContextProvider>
    );
}

export async function generateSitePageViewport(context: GitBookSiteContext): Promise<Viewport> {
    const { customization } = context;

    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

/**
 * A string concatenation of the site structure (sections and variants) titles.
 */
function getSiteStructureTitle(context: GitBookSiteContext): string | null {
    const { visibleSections: sections, siteSpace, visibleSiteSpaces: siteSpaces } = context;

    const title = [];
    if (
        sections &&
        sections.current.default === false && // Only if the current section is not the default one
        sections.list.filter((section) => section.object === 'site-section').length > 1 // Only if there are multiple sections
    ) {
        title.push(sections.current.title);
    }
    if (
        siteSpaces.length > 1 && // Only if there are multiple variants
        siteSpace.default === false && // Only if the variant is not the default one
        siteSpaces.filter((space) => space.space.language === siteSpace.space.language).length > 1 // Only if there are multiple variants *for the current language*. This filters out spaces that are "just" translations of each other, not versions.
    ) {
        title.push(siteSpace.title);
    }
    return title.join(' ');
}

export async function generateSitePageMetadata(props: SitePageProps): Promise<Metadata> {
    const { context, pageTarget, pageMetaLinks } = await getPageDataWithFallback({
        context: props.context,
        pagePathParams: props.pageParams,
    });

    if (!pageTarget) {
        if (context.isFallback) {
            redirect(context.linker.toPathInSpace('/'));
        }
        notFound();
    }

    const { page, ancestors } = pageTarget;
    const { customization, revision, linker, imageResizer } = context;

    const canonical = (
        pageMetaLinks?.canonical
            ? new URL(
                  // If the canonical link is an absolute URL, use it as is.
                  URL.canParse(pageMetaLinks.canonical)
                      ? pageMetaLinks.canonical
                      : linker.toAbsoluteURL(pageMetaLinks.canonical)
              ).toString()
            : // If no canonical is set, use the current page URL (default case)
              linker.toAbsoluteURL(linker.toPathForPage({ pages: revision.pages, page }))
    ).replace(/\/+$/, ''); // Trim trailing slashes in canonical URL to match the redirect behavior

    const alternates = pageMetaLinks?.alternates.reduce<{
        languages: Record<string, string>;
        generic: Array<{
            title?: string;
            url: string;
        }>;
    }>(
        (acc, alt) => {
            if (alt.space?.language) {
                acc.languages[alt.space.language] = URL.canParse(alt.href)
                    ? alt.href
                    : linker.toAbsoluteURL(alt.href);
            } else {
                acc.generic.push({
                    url: URL.canParse(alt.href) ? alt.href : linker.toAbsoluteURL(alt.href),
                });
            }
            return acc;
        },
        { languages: {}, generic: [] }
    );

    return {
        title: getPageFullTitle(context, page),
        description: page.description ?? '',
        alternates: {
            canonical,
            languages: alternates?.languages,
            types: {
                'text/markdown': `${linker.toAbsoluteURL(linker.toPathInSpace(page.path))}.md`,
                // We always reference the RSS feed even if the page doesn't have updates blocks,
                // It might result in 404, but we can't know here if the page has updates blocks.
                'application/rss+xml': [{ url: getPageRSSURL(context, page), title: 'RSS Feed' }],
                // Currently it will output with an empty "type" like <link rel="alternate" href="..." type />
                // Team at Vercel is aware of this and will ensure it will be omitted when the value is empty in future versions of Next.js
                // https://gitbook.slack.com/archives/C04K6MV5W1K/p1763034072958419?thread_ts=1762937203.511629&cid=C04K6MV5W1K
                ...(alternates?.generic ? { '': alternates?.generic } : {}),
            },
        },
        openGraph: {
            images: [
                customization.socialPreview.url
                    ? await getResizedImageURL(imageResizer, customization.socialPreview.url, {
                          width: 1200,
                          height: 630,
                      })
                    : linker.toAbsoluteURL(linker.toPathInSpace(`~gitbook/ogimage/${page.id}`)),
            ],
        },
        robots:
            (await isSiteIndexable(context)) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Fetches all the data required to render the site page.
 */
export async function getSitePageData(props: SitePageProps) {
    const { context, pageTarget, pageMetaLinks } = await getPageDataWithFallback({
        context: props.context,
        pagePathParams: props.pageParams,
    });

    const rawPathname = getPathnameParam(props.pageParams);
    if (!pageTarget) {
        const pathname = rawPathname.toLowerCase();
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(context.linker.toPathInSpace(pathname));
        } else {
            // If the page is not found and we are in fallback mode, return a redirect to the basepath
            if (context.isFallback) {
                redirect(context.linker.toPathInSpace('/'));
            }
            notFound();
        }
    } else if (getPagePath(context.revision.pages, pageTarget.page) !== rawPathname) {
        redirect(
            context.linker.toPathForPage({
                pages: context.revision.pages,
                page: pageTarget.page,
            })
        );
    }

    const { customization, visibleSections } = context;
    const { page, ancestors } = pageTarget;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withFullPageCover = !!(
        page.cover &&
        page.layout.cover &&
        page.layout.coverSize === 'full'
    );
    const withPageFeedback = customization.feedback.enabled;

    const withSections = Boolean(visibleSections && visibleSections.list.length > 0);

    const document = await getPageDocument(context, page);

    return {
        context,
        page,
        ancestors,
        document,
        withSections,
        withPageFeedback,
        withFullPageCover,
        withTopHeader,
        pageMetaLinks,
    };
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(args: {
    context: GitBookSiteContext;
    pagePathParams: PagePathParams;
}) {
    const { context: baseContext, pagePathParams } = args;
    const { context, pageTarget } = await fetchPageData(baseContext, pagePathParams);
    const pageMetaLinks = await (pageTarget?.page && shouldResolveMetaLinks(context.site.id)
        ? resolvePageMetaLinks(context, pageTarget.page.id)
        : null);

    return {
        context: {
            ...context,
            page: pageTarget?.page,
        },
        pageTarget,
        pageMetaLinks,
    };
}

/**
 * Resolve the meta links (canonical and alternates) for a page.
 */
async function resolvePageMetaLinks(
    context: GitBookSiteContext,
    pageId: string
): Promise<PageMetaLinks> {
    const pageMetaLinks = await getDataOrNull(
        context.dataFetcher.listRevisionPageMetaLinks({
            spaceId: context.space.id,
            revisionId: context.revisionId,
            pageId,
        })
    );

    if (pageMetaLinks) {
        const canonicalResolution = pageMetaLinks.canonical
            ? resolveContentRef(pageMetaLinks.canonical, context).then((resolved) => resolved?.href)
            : null;

        const alternatesResolutions = (pageMetaLinks.alternates || []).map((link) =>
            resolveContentRef(link, context).then((resolved) => ({
                href: resolved?.href ?? null,
                space: resolved?.space
                    ? { id: resolved.space.id, language: resolved.space.language }
                    : null,
            }))
        );

        const [resolvedCanonical, resolvedAlternates] = await Promise.all([
            canonicalResolution,
            Promise.all(alternatesResolutions),
        ]);

        return {
            canonical: resolvedCanonical ?? null,
            alternates: resolvedAlternates.filter(
                (alt): alt is { href: string; space: AlternateLinkSpace | null } => !!alt.href
            ),
        };
    }

    return {
        canonical: null,
        alternates: [],
    };
}

/**
 * Determine whether to resolve meta links for a site based on a percentage rollout.
 */
function shouldResolveMetaLinks(siteId: string): boolean {
    const META_LINKS_PERCENTAGE_ROLLOUT = 25;
    const ALLOWED_SITES: Record<string, boolean> = {
        site_CZrtk: true,
    };

    if (ALLOWED_SITES[siteId] || process.env.NODE_ENV === 'development') {
        return true;
    }

    // compute a simple hash of the siteId
    let hash = 0;
    for (let i = 0; i < siteId.length; i++) {
        hash = (hash << 5) - hash + siteId.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash % 100) < META_LINKS_PERCENTAGE_ROLLOUT;
}

/**
 * Get the <title> for a page.
 */
export function getPageFullTitle(context: GitBookSiteContext, page: RevisionPageDocument) {
    const { site } = context;
    const siteStructureTitle = getSiteStructureTitle(context);

    return [
        page.title,
        // Prevent duplicate titles by comparing against the page title.
        page.title !== siteStructureTitle ? siteStructureTitle : null, // The first page of a section is often the same as the section title, so we don't need to show it.
        page.title !== site.title ? site.title : null, // The site title can also be the same as the site title on the site's landing page.
    ]
        .filter(Boolean)
        .join(' | ');
}
