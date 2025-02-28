import {
    type GitBookBaseContext,
    type GitBookSiteContext,
    fetchSiteContextByIds,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import type { GitBookDataFetcher } from '@v2/lib/data/types';
import { createImageResizer } from '@v2/lib/images';
import { createLinker } from '@v2/lib/links';
import { headers } from 'next/headers';

import {
    type SiteContentPointer,
    type SpaceContentPointer,
    api,
    getChangeRequest,
    getComputedDocument,
    getDocument,
    getEmbedByUrlInSpace,
    getLatestOpenAPISpecVersionContent,
    getPublishedContentByUrl,
    getPublishedContentSite,
    getReusableContent,
    getRevision,
    getRevisionFile,
    getRevisionPageByPath,
    getRevisionPages,
    getSiteRedirectBySource,
    getSpace,
    getUserById,
} from './api';
import { getDynamicCustomizationSettings } from './customization';
import { getBasePath, getHost } from './links';

/*
 * Code that will be used until the migration to v2 is complete.
 */

/**
 * Get the base context for the V1.
 */
export async function getV1BaseContext(): Promise<GitBookBaseContext> {
    const host = await getHost();
    const basePath = await getBasePath();

    const linker = createLinker({
        host,
        pathname: basePath,
    });

    const dataFetcher = await getDataFetcherV1();

    const imageResizer = createImageResizer({
        host,
        // In V1, we always resize at the top level of the hostname, not relative to the content.
        linker: createLinker({
            host,
            pathname: '/',
        }),
    });

    return {
        linker,
        dataFetcher,
        imageResizer,
    };
}

/**
 * Data fetcher that uses the old code of the v1.
 * Try not to use this as much as possible, and instead take the data fetcher from the props.
 * This data fetcher should only be used at the top of the tree.
 */
async function getDataFetcherV1(): Promise<GitBookDataFetcher> {
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
                params.visitorAuthToken ?? undefined,
                params.redirectOnError ? true : undefined
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

        getRevision(params) {
            return getRevision(params.spaceId, params.revisionId, {
                metadata: params.metadata,
            });
        },

        getRevisionFile(params) {
            return getRevisionFile(params.spaceId, params.revisionId, params.fileId);
        },

        getDocument(params) {
            return getDocument(params.spaceId, params.documentId);
        },

        getComputedDocument(params) {
            return getComputedDocument(params.spaceId, params.source);
        },

        getRevisionPages(params) {
            return getRevisionPages(params.spaceId, params.revisionId, {
                metadata: params.metadata,
            });
        },

        getRevisionPageByPath(params) {
            return getRevisionPageByPath(params.spaceId, params.revisionId, params.path);
        },

        getReusableContent(params) {
            return getReusableContent(params.spaceId, params.revisionId, params.reusableContentId);
        },

        getLatestOpenAPISpecVersionContent(params) {
            return getLatestOpenAPISpecVersionContent(params.organizationId, params.slug);
        },

        getSiteRedirectBySource(params) {
            return getSiteRedirectBySource(params);
        },

        getEmbedByUrl(params) {
            return getEmbedByUrlInSpace(params.spaceId, params.url);
        },
    };
}

/**
 * Fetch the context for a site pointer.
 */
export async function fetchV1ContextForSitePointer(pointer: SiteContentPointer) {
    const baseContext = await getV1BaseContext();
    const headersList = await headers();

    const context = await fetchSiteContextByIds(baseContext, {
        organization: pointer.organizationId,
        site: pointer.siteId,
        siteSection: pointer.siteSectionId,
        siteSpace: pointer.siteSpaceId,
        space: pointer.spaceId,
        shareKey: pointer.siteShareKey,
        changeRequest: pointer.changeRequestId,
        revision: pointer.revisionId,
        visitorAuthToken: headersList.get('x-gitbook-visitor-token'),
    });

    context.customization = await getDynamicCustomizationSettings(context.customization);

    return context;
}

/**
 * Fetch the context for a space pointer.
 */
export async function fetchV1ContextForSpacePointer(pointer: SpaceContentPointer) {
    const baseContext = await getV1BaseContext();
    return fetchSpaceContextByIds(baseContext, {
        space: pointer.spaceId,
        shareKey: undefined,
        changeRequest: pointer.changeRequestId,
        revision: pointer.revisionId,
    });
}

/**
 * Get the site pointer (ids) from a site context.
 */
export function getSitePointerFromContext(context: GitBookSiteContext): SiteContentPointer {
    return {
        organizationId: context.organizationId,
        siteId: context.site.id,
        siteSectionId: context.sections?.current?.id,
        siteSpaceId: context.siteSpace.id,
        spaceId: context.space.id,
        revisionId: context.revisionId,
        changeRequestId: context.changeRequest?.id,
        siteShareKey: context.shareKey,
    };
}
