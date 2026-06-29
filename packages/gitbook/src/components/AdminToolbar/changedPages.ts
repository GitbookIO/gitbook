import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull, ignoreAllThrownError } from '@/lib/data';
import { getToolbarChangedPagesFromChanges } from './changedPagesMapper';
import type { MinimalChangedPages } from './types';

export const TOOLBAR_CHANGED_PAGES_LIMIT = 100;

/**
 * Fetch and reduce semantic changes to the minimal list needed by the toolbar client.
 */
export async function getToolbarChangedPages(
    context: GitBookSiteContext
): Promise<MinimalChangedPages | null> {
    // The changed-pages list is a non-critical toolbar enhancement. Any failure to fetch or
    // reduce the changes should simply hide the button, never break rendering of the site page.
    return ignoreAllThrownError(fetchToolbarChangedPages(context));
}

async function fetchToolbarChangedPages(
    context: GitBookSiteContext
): Promise<MinimalChangedPages | null> {
    const changes = context.changeRequest
        ? await getDataOrNull(
              context.dataFetcher.getChangeRequestChanges({
                  spaceId: context.space.id,
                  changeRequestId: context.changeRequest.id,
                  limit: TOOLBAR_CHANGED_PAGES_LIMIT,
              })
          )
        : context.revisionId !== context.space.revision
          ? await getDataOrNull(
                context.dataFetcher.getRevisionSemanticChanges({
                    spaceId: context.space.id,
                    revisionId: context.revisionId,
                    limit: TOOLBAR_CHANGED_PAGES_LIMIT,
                })
            )
          : null;

    if (!changes) {
        return null;
    }

    const pages = getToolbarChangedPagesFromChanges({
        changes: changes.changes,
        editorBaseURL: context.changeRequest?.urls.app ?? context.revision.urls.app,
        linker: context.linker,
        pages: context.revision.pages,
    });

    return pages.length > 0
        ? {
              pages,
              more: changes.more ?? 0,
          }
        : null;
}
