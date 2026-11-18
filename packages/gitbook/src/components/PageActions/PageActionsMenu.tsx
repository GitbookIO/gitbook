import type { RevisionPageDocument } from '@gitbook/api';

import { PageActionsDropdown } from './PageActionsDropdown';
import { getPageActionsURLs } from './pageActionsURLs';
import type { GitBookSiteContext } from '@/lib/context';

/**
 * Menu of the page actions. It loads what it shows from the context and the page alone, so it can be
 * rendered and cached apart from the page body.
 */
export async function PageActionsMenu(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
}) {
    const { context, page } = props;
    const { linker, revision } = context;

    return (
        <PageActionsDropdown
            siteTitle={context.site.title}
            urls={await getPageActionsURLs(context, page)}
            actions={context.customization.pageActions}
            page={{
                id: page.id,
                title: page.title,
                path: page.path,
                href: linker.toPathForPage({ pages: revision.pages, page }),
            }}
        />
    );
}
