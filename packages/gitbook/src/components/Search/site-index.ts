'use client';

/**
 * Client-side access to the `~gitbook/site-index` JSON, shared by every consumer
 * (instant search in `useLocalSearchResults`, related pages on the 404 page).
 *
 * Loading strategy: the download starts as early as possible (server-rendered
 * preload hint in `SiteLayout`, deduped here at first call) and is kept as raw
 * text so the multi-MB `JSON.parse` — main-thread work — is only paid when a
 * consumer actually needs the pages.
 */

export interface SiteIndexBreadcrumb {
    label: string;
    icon?: string;
    emoji?: string;
}

/** Raw entry from the `~gitbook/site-index` JSON response */
export interface SiteIndexPage {
    id: string;
    title: string;
    pathname: string;
    siteSpaceId: string;
    /** BCP-47 language code emitted by the index route, absent when no language is set. */
    lang?: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: SiteIndexBreadcrumb[];
}

let siteIndexText: Promise<string> | null = null;

/**
 * Start (or reuse) the single-flight download of the raw index. Errors clear the
 * cache so the next consumer retries.
 */
export function prefetchSiteIndex(indexURL: string): void {
    fetchSiteIndexText(indexURL).catch(() => {
        // Ignored: consumers surface errors when they actually read the index.
    });
}

/**
 * Get the parsed index pages. Parses per call (cheap for the rare second
 * consumer) so the parsed object graph is never retained at module scope.
 */
export async function fetchSiteIndex(
    indexURL: string
): Promise<{ version: 1; pages: SiteIndexPage[] }> {
    return JSON.parse(await fetchSiteIndexText(indexURL));
}

/**
 * Drop the cached raw text (several MB for large sites) once a consumer has
 * turned it into a longer-lived form. Purely a memory release: a later consumer
 * re-fetches, hitting the HTTP cache.
 */
export function releaseSiteIndex(): void {
    siteIndexText = null;
}

function fetchSiteIndexText(indexURL: string): Promise<string> {
    if (!siteIndexText) {
        siteIndexText = fetch(indexURL).then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch search index: ${response.status}`);
            }
            return response.text();
        });

        siteIndexText.catch(() => {
            siteIndexText = null;
        });
    }

    return siteIndexText;
}
