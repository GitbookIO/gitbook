'use client';

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

/** Fetch the pages of the site from the `~gitbook/site-index` JSON. */
export async function fetchSiteIndex(
    indexURL: string
): Promise<{ version: 1; pages: SiteIndexPage[] }> {
    const response = await fetch(indexURL);
    if (!response.ok) {
        throw new Error(`Failed to fetch site index: ${response.status}`);
    }

    return response.json();
}
