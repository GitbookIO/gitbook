import type { GitBookLinker } from '@/lib/links';
import { getPagePath, resolvePageId } from '@/lib/pages';
import { joinPathWithBaseURL } from '@/lib/paths';
import {
    type ChangedRevisionPage,
    type Revision,
    RevisionPageType,
    type RevisionSemanticChange,
} from '@gitbook/api';
import type { MinimalChangedPage } from './types';

// When one page has multiple semantic changes, show the label that best summarizes its final state.
const CHANGE_STATUS_SUMMARY_ORDER: Array<MinimalChangedPage['status']> = [
    'edited',
    'moved',
    'created',
    'deleted',
];

export function getToolbarChangedPagesFromChanges(input: {
    changes: RevisionSemanticChange[];
    linker: Pick<GitBookLinker, 'toPathForPage'>;
    pages: Revision['pages'];
    editorBaseURL: string;
}): MinimalChangedPage[] {
    const changedPages = new Map<string, MinimalChangedPage>();

    for (const change of input.changes) {
        // Only real document page changes can become toolbar rows; computed/link/group pages are ignored.
        const pageChange = getChangedPageChange(change);
        if (!pageChange || pageChange.page.type !== RevisionPageType.Document) {
            continue;
        }

        // Resolve against the current revision so preview links use the current title and path.
        const resolved = resolvePageId(input.pages, pageChange.page.id);
        const isDeleted = pageChange.status === 'deleted';
        const currentPage = resolved?.page;
        const path = currentPage ? getPagePath(input.pages, currentPage) : pageChange.page.path;

        if (!path && !currentPage) {
            continue;
        }

        // Missing non-deleted pages cannot be linked reliably from the preview.
        if (!currentPage && !isDeleted) {
            continue;
        }

        // Deleted pages may no longer exist in the preview, so link to their editor change.
        if (!currentPage) {
            changedPages.set(pageChange.page.id, {
                id: pageChange.page.id,
                title: pageChange.page.title,
                path: path ?? '',
                href: joinPathWithBaseURL(input.editorBaseURL, path ?? ''),
                status: pageChange.status,
                action: 'editor',
            });
            continue;
        }

        const pageId = currentPage.id;
        const existing = changedPages.get(pageId);
        // The API can return multiple changes for one page; keep the clearest one-row summary.
        if (existing && shouldKeepExistingPageChange(existing.status, pageChange.status)) {
            continue;
        }

        changedPages.set(pageId, {
            id: pageId,
            title: currentPage.title,
            path: path ?? '',
            href: isDeleted
                ? joinPathWithBaseURL(input.editorBaseURL, path ?? '')
                : input.linker.toPathForPage({
                      pages: input.pages,
                      page: currentPage,
                  }),
            status: pageChange.status,
            action: isDeleted ? 'editor' : 'preview',
        });
    }

    return Array.from(changedPages.values());
}

function getChangedPageChange(
    change: RevisionSemanticChange
): { page: ChangedRevisionPage; status: MinimalChangedPage['status'] } | null {
    switch (change.type) {
        case 'page_created':
            return { page: change.page, status: 'created' };
        case 'page_edited':
            return { page: change.page, status: 'edited' };
        case 'page_moved':
            return { page: change.page, status: 'moved' };
        case 'page_deleted':
            return { page: change.page, status: 'deleted' };
        default:
            return null;
    }
}

function shouldKeepExistingPageChange(
    existing: MinimalChangedPage['status'],
    next: MinimalChangedPage['status']
) {
    return getChangeStatusSummaryIndex(existing) >= getChangeStatusSummaryIndex(next);
}

function getChangeStatusSummaryIndex(status: MinimalChangedPage['status']) {
    return CHANGE_STATUS_SUMMARY_ORDER.indexOf(status);
}
