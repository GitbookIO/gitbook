import { SiteContentPointer, SpaceContentPointer } from '@/lib/api';
import { getSiteContentPointer, getSpacePointer } from '@/lib/pointer';

/**
 * PDF generation can be done at the site level (e.g. docs.foo.com/~gitbook/pdf) or
 * at the space level (e.g. open.gitbook.com/~space/:spaceId/~gitbook/pdf). This function
 * returns the pointer depending on the context.
 */
export function getSiteOrSpacePointerForPDF(): SiteContentPointer | SpaceContentPointer {
    try {
        return getSiteContentPointer();
    } catch (error) {
        return getSpacePointer();
    }
}
