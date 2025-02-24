import { GitBookSiteContext, GitBookSpaceContext } from '@v2/lib/context';

import { SiteContentPointer, SpaceContentPointer } from '@/lib/api';
import { getSiteContentPointer, getSpacePointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer, fetchV1ContextForSpacePointer } from '@/lib/v1';

/**
 * PDF generation can be done at the site level (e.g. docs.foo.com/~gitbook/pdf) or
 * at the space level (e.g. open.gitbook.com/~space/:spaceId/~gitbook/pdf) which is
 * for PDF export of in-app private spaces.
 *
 * This function returns the pointer depending on the context.
 */
export async function getSiteOrSpacePointerForPDF(): Promise<
    SiteContentPointer | SpaceContentPointer
> {
    try {
        return await getSiteContentPointer();
    } catch (error) {
        return getSpacePointer();
    }
}

/**
 * Get the context for the PDF pointer.
 */
export async function getV1ContextForPDF(): Promise<GitBookSiteContext | GitBookSpaceContext> {
    const pointer = await getSiteOrSpacePointerForPDF();

    return 'siteId' in pointer && pointer.siteId
        ? await fetchV1ContextForSitePointer(pointer)
        : await fetchV1ContextForSpacePointer(pointer);
}
