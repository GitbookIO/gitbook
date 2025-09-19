import type { GitBookSiteContext } from '@/lib/context';
import { resolveFirstDocument } from '@/lib/pages';
import {
    type RevisionPageDocument,
    type RevisionPageGroup,
    SiteVisibility,
    type Space,
} from '@gitbook/api';
import { headers } from 'next/headers';

/**
 * Return true if a page is indexable in search.
 */
export function isPageIndexable(
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>,
    page: RevisionPageDocument | RevisionPageGroup
): boolean {
    // @ts-ignore - noIndex and noRobotsIndex are not in the type
    // until we fix the deprecated APIs
    return (
        // @ts-ignore
        !page.noIndex &&
        // @ts-ignore
        !page.noRobotsIndex &&
        // @ts-ignore
        ancestors.every((ancestor) => !ancestor.noIndex && !ancestor.noRobotsIndex)
    );
}

/**
 * Return true if a space should be indexed by search engines.
 */
export async function isSiteIndexable(context: GitBookSiteContext) {
    const headersList = await headers();

    if (
        process.env.GITBOOK_BLOCK_SEARCH_INDEXATION &&
        !headersList.has('x-gitbook-search-indexation')
    ) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    if (context.changeRequest || context.revisionId !== context.space.revision) {
        return false;
    }

    return shouldIndexVisibility(context.site.visibility);
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}

/**
 * Return true if the first page of a site space is indexable.
 */
export async function isFirstPageIndexable(
    context: GitBookSiteContext,
    space: Space
): Promise<boolean> {
    // Get the revision for the site space
    const revision = await context.dataFetcher.getRevision({
        spaceId: space.id,
        revisionId: space.revision,
    });

    if (revision.error) {
        return false;
    }

    // Find the first document page in the revision
    const firstDocument = resolveFirstDocument(revision.data.pages, []);

    if (!firstDocument) {
        return false;
    }

    // Check if the first page is indexable
    return isPageIndexable(firstDocument.ancestors, firstDocument.page);
}

/**
 * Check if a section has any site spaces with indexable first pages.
 * This function actually checks the indexability by calling the async function.
 */
export async function hasIndexableSpaces(
    context: GitBookSiteContext,
    section: { siteSpaces: Array<{ space: Space }> }
): Promise<boolean> {
    // Check if any site space in the section has an indexable first page
    const results = await Promise.allSettled(
        section.siteSpaces.map((siteSpace) => isFirstPageIndexable(context, siteSpace.space))
    );

    // Return true if any of the checks succeeded and returned true
    return results.some((result) => result.status === 'fulfilled' && result.value === true);
}

/**
 * Filter sections to only include those that have at least one indexable site space.
 */
export async function filterSectionsWithIndexableSpaces<
    T extends { siteSpaces: Array<{ space: Space }> },
>(context: GitBookSiteContext, sections: T[]): Promise<T[]> {
    const filteredSections: T[] = [];

    for (const section of sections) {
        const hasIndexable = await hasIndexableSpaces(context, section);
        if (hasIndexable) {
            filteredSections.push(section);
        }
    }

    return filteredSections;
}

/**
 * Pre-compute indexable status for all site spaces in sections.
 * This should be called during context creation to avoid async operations in components.
 */
export async function computeSectionsIndexableStatus(
    context: GitBookSiteContext,
    sections: Array<{ siteSpaces: Array<{ space: Space }> }>
): Promise<Array<{ siteSpaces: Array<{ space: Space; indexable: boolean }> }>> {
    return Promise.all(
        sections.map(async (section) => ({
            ...section,
            siteSpaces: await Promise.all(
                section.siteSpaces.map(async (siteSpace) => ({
                    ...siteSpace,
                    indexable: await isFirstPageIndexable(context, siteSpace.space),
                }))
            ),
        }))
    );
}
