'use server';

import type * as React from 'react';

import { IconsProvider } from '@gitbook/icons';

import { PageBodyDocument } from '../PageBody/PageBodyDocument';
import { getPageDocument } from '@/lib/data';
import { getDocumentSections } from '@/lib/document-sections';
import {
    getContentInlineIconSourceRequests,
    getCustomizationIconStyle,
    getInlineIconSources,
} from '@/lib/icons/inline';
import { getLogger } from '@/lib/logger';
import { resolvePageId } from '@/lib/pages';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import {
    findUpdateAnchorPage,
    getDocumentFilterableTags,
    normalizeUpdatesFilterTags,
    paginateUpdatesDocument,
} from '@/lib/updates';
import { UPDATES_MAX_PAGE } from '@/lib/updates-url';

type UpdatesPageAction = {
    pageId: string;
    tags: string[];
    isEmbeddable: boolean;
};

export type FilteredUpdatesPageResult =
    | {
          status: 'ok';
          revisionId: string;
          content: React.ReactNode;
          sections: Awaited<ReturnType<typeof getDocumentSections>>;
          pagination: NonNullable<ReturnType<typeof paginateUpdatesDocument>['pagination']>;
      }
    | {
          status: 'unfiltered';
          revisionId: string;
      }
    | {
          status: 'error';
      };

export async function getFilteredUpdatesPage(
    options: UpdatesPageAction & { page: number }
): Promise<FilteredUpdatesPageResult> {
    const logger = getLogger().subLogger('updatesPagination');
    if (!Number.isInteger(options.page) || options.page < 1 || options.page > UPDATES_MAX_PAGE) {
        logger.warn('Invalid filtered updates page number');
        return { status: 'error' };
    }
    try {
        const { context, page, document } = await getUpdatesPageDocument(options);
        const availableTags = new Set(
            getDocumentFilterableTags(document, context.revision).map((tag) => tag.slug)
        );
        const tags = normalizeUpdatesFilterTags(options.tags, availableTags);
        if (!tags.length) {
            logger.info('No selected tags on the current revision', { pageId: page.id });
            return { status: 'unfiltered', revisionId: context.revisionId };
        }

        const result = paginateUpdatesDocument(document, context.revision, {
            page: options.page,
            tags,
        });
        if (!result.pagination) {
            logger.info('Current revision no longer needs updates pagination', { pageId: page.id });
            return { status: 'unfiltered', revisionId: context.revisionId };
        }

        const [sections, iconSources] = await Promise.all([
            getDocumentSections(context, result.document),
            getInlineIconSources(
                getContentInlineIconSourceRequests({
                    iconStyle: getCustomizationIconStyle(context.customization),
                    document: result.document,
                })
            ),
        ]);
        logger.info('Rendered filtered updates page', {
            siteId: context.site.id,
            pageId: page.id,
            page: result.pagination.page,
            totalItems: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
        });
        return {
            status: 'ok',
            revisionId: context.revisionId,
            content: (
                <IconsProvider iconSources={iconSources}>
                    <PageBodyDocument context={context} page={page} document={result.document} />
                </IconsProvider>
            ),
            sections,
            pagination: result.pagination,
        };
    } catch {
        logger.warn('Could not render filtered updates page');
        return { status: 'error' };
    }
}

export async function resolveUpdatesAnchor(options: UpdatesPageAction & { anchor: string }) {
    const logger = getLogger().subLogger('updatesPagination');
    try {
        const { context, page, document } = await getUpdatesPageDocument(options);
        const result = findUpdateAnchorPage(document, context.revision, options);
        logger.info('Resolved updates anchor', {
            siteId: context.site.id,
            pageId: page.id,
            found: result.found,
            page: result.found && result.page,
        });
        if (result.found && result.page <= UPDATES_MAX_PAGE) {
            return result;
        }
    } catch {
        logger.warn('Could not resolve updates anchor');
    }
    return { found: false as const };
}

async function getUpdatesPageDocument({ pageId, isEmbeddable }: UpdatesPageAction) {
    const context = await fetchServerActionSiteContext(
        await getServerActionBaseContext({ isEmbeddable })
    );
    const target = resolvePageId(context.revision.pages, pageId);
    if (!target) {
        throw new Error('Updates page not found');
    }

    const { page } = target;
    const document = await getPageDocument(context, page);
    if (!document) {
        throw new Error('Updates document not found');
    }
    return { context: { ...context, page }, page, document };
}
