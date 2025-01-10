import { SiteContentPointer, SpaceContentPointer } from '@/lib/api';
import { GitBookContext } from '@/lib/gitbook-context';
import { getSiteContentPointer, getSpacePointer } from '@/lib/pointer';

/**
 * PDF generation can be done at the site level (e.g. docs.foo.com/~gitbook/pdf) or
 * at the space level (e.g. open.gitbook.com/~space/:spaceId/~gitbook/pdf) which is
 * for PDF export of in-app private spaces.
 *
 * This function returns the pointer depending on the context.
 */
export function getSiteOrSpacePointerForPDF(
    ctx: GitBookContext,
): SiteContentPointer | SpaceContentPointer {
    try {
        return getSiteContentPointer(ctx);
    } catch (error) {
        return getSpacePointer(ctx);
    }
}
