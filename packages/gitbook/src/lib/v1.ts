import { RevisionPageType } from '@gitbook/api';
import type { GitBookDataFetcher } from '@v2/lib/data/types';
import type { Linker } from '@v2/lib/links/types';

import {
    api,
    getChangeRequest,
    getLatestOpenAPISpecVersionContent,
    getPublishedContentByUrl,
    getPublishedContentSite,
    getReusableContent,
    getRevisionFile,
    getRevisionPages,
    getSpace,
    getUserById,
} from './api';
import { getBasePath, getBaseUrl, getPagePDFContainerId } from './links';
import { getPagePath } from './pages';

/*
 * Code that will be used until the migration to v2 is complete.
 */

/**
 * Data fetcher that uses the old code of the v1.
 * Try not to use this as much as possible, and instead take the data fetcher from the props.
 * This data fetcher should only be used at the top of the tree.
 */
export async function getDataFetcherV1(): Promise<GitBookDataFetcher> {
    const apiClient = await api();

    return {
        apiEndpoint: apiClient.client.endpoint,

        getUserById(userId) {
            return getUserById(userId);
        },

        // @ts-ignore - types are compatible enough, and this will not be called in v1 this way
        getPublishedContentByUrl(params) {
            return getPublishedContentByUrl(
                params.url,
                params.visitorAuthToken,
                params.redirectOnError ? true : undefined,
            );
        },

        getPublishedContentSite(params) {
            return getPublishedContentSite(params);
        },

        getSpace(params) {
            return getSpace(params.spaceId, params.shareKey);
        },

        getChangeRequest(params) {
            return getChangeRequest(params.spaceId, params.changeRequestId);
        },

        getRevisionFile(params) {
            return getRevisionFile(params.spaceId, params.revisionId, params.fileId);
        },

        getRevisionPages(params) {
            return getRevisionPages(params.spaceId, params.revisionId, {
                metadata: params.metadata,
            });
        },

        getReusableContent(params) {
            return getReusableContent(params.spaceId, params.revisionId, params.reusableContentId);
        },

        getLatestOpenAPISpecVersionContent(params) {
            return getLatestOpenAPISpecVersionContent(params.organizationId, params.slug);
        },
    };
}

/**
 * Linker to generate links in the current site.
 */
export async function getLinkerV1(
    options: {
        /**
         * If defined, we are generating a PDF of the specific page IDs,
         * and these pages will be rendered in the same HTML output.
         */
        pdf?: string[];
    } = {},
): Promise<Linker> {
    const { pdf } = options;

    const basePath = await getBasePath();
    const basePathWithHost = await getBaseUrl();

    const linker: Linker = {
        toPathInSite(relativePath) {
            throw new Error('Not implemented in v1');
        },

        toPathInSpace(relativePath) {
            return `${basePath}${relativePath.startsWith('/') ? relativePath.slice(1) : relativePath}`;
        },

        toPathForPage({ page, pages, anchor }) {
            if (pdf) {
                if (pdf.includes(page.id)) {
                    return '#' + getPagePDFContainerId(page, anchor);
                } else {
                    if (page.type === RevisionPageType.Group) {
                        return '#';
                    }

                    // Use an absolute URL to the page
                    return page.urls.app;
                }
            }

            return linker.toPathInSpace(getPagePath(pages, page)) + (anchor ? '#' + anchor : '');
        },

        toAbsoluteURL(relativePath) {
            return `${basePathWithHost}${relativePath.startsWith('/') ? relativePath.slice(1) : relativePath}`;
        },
    };

    return linker;
}
