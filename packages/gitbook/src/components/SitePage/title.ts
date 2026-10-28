import type { RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { getSiteStructureTitle } from '@/lib/sites';

/**
 * Get the <title> for a page.
 */
export function getPageFullTitle(context: GitBookSiteContext, page: RevisionPageDocument) {
    const { site } = context;
    const siteStructureTitle = getSiteStructureTitle(context);
    const tagTitle = page.tagTitle || page.title;

    return [
        tagTitle,
        // The first page of a section is often the same as the section title, so we don't need to show it.
        tagTitle !== siteStructureTitle ? siteStructureTitle : null,
        // The site title can also be the same as the page title on the site's landing page.
        tagTitle !== site.title ? site.title : null,
    ]
        .filter(Boolean)
        .join(' | ');
}
