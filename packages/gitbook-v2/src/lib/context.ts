import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { GitBookAPI } from '@gitbook/api';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { GitBookContext } from '@/lib/v2/context';

/**
 * Context when rendering a site.
 */
export interface GitBookSiteContext extends GitBookContext {
    /**
     * ID of the organization.
     */
    organizationId: string;

    /**
     * Site ID.
     */
    siteId: string;
}

/**
 * Context when rendering a space in a site.
 */
export interface GitBookSiteSpaceContext extends GitBookSiteContext {
    /**
     * ID of the space.
     */
    spaceId: string;

    /**
     * ID of the site section.
     */
    siteSectionId: string | undefined;

    /**
     * ID of the site space.
     */
    siteSpaceId: string;

    /**
     * Share key of the site.
     */
    siteShareKey: string | undefined;
}

/**
 * Create a site context, when rendering a static page.
 */
export async function createStaticSiteContext(url: string[]): Promise<GitBookSiteSpaceContext> {
    const context = createStaticContext();
    return fetchSiteContext(url, context);
}

/**
 * Create a site context, when rendering a dynamic page.
 */
export async function createDynamicSiteContext(url: string[]): Promise<GitBookSiteSpaceContext> {
    const context = await createDynamicContext();
    return fetchSiteContext(url, context);
}

/**
 * Fetch the context of a site for a given URL and a base context.
 */
async function fetchSiteContext(
    urlParts: string[],
    baseContext: GitBookContext,
): Promise<GitBookSiteSpaceContext> {
    const { api } = baseContext;
    const url = getURLFromParams(urlParts);
    const { data } = await api.urls.getPublishedContentByUrl({
        url,
    });

    if ('redirect' in data) {
        redirect(data.redirect);
    }

    return {
        ...baseContext,
        api: new GitBookAPI({
            endpoint: api.endpoint,
            authToken: data.apiToken,
            userAgent: api.userAgent,
        }),
        siteId: data.site,
        organizationId: data.organization,
        siteSectionId: data.siteSection,
        siteSpaceId: data.siteSpace,
        spaceId: data.space,
    };
}

/**
 * Create the base context when rendering statically.
 */
function createStaticContext(): GitBookContext {
    const api = new GitBookAPI({
        authToken: GITBOOK_API_TOKEN,
        endpoint: GITBOOK_API_URL,
        userAgent: GITBOOK_USER_AGENT,
    });

    return createContextFromClient(api);
}

/**
 * Create the base context when rendering dynamically.
 * The context will depend on the request.
 */
async function createDynamicContext(): Promise<GitBookContext> {
    const headersSet = await headers();

    const api = new GitBookAPI({
        authToken: headersSet.get('x-gitbook-token') ?? GITBOOK_API_TOKEN,
        endpoint: headersSet.get('x-gitbook-api') ?? GITBOOK_API_URL,
        userAgent: GITBOOK_USER_AGENT,
    });

    return createContextFromClient(api);
}

function createContextFromClient(api: GitBookAPI): GitBookContext {
    return {
        api,
        getLink: (pathname: string) => pathname,
        getPublishedContentSite: async (organizationId: string, siteId: string) => {
            const { data } = await api.orgs.getPublishedContentSite(organizationId, siteId);
            return data;
        },
        getRevisionFile: async (spaceId: string, revisionId: string, file: string) => {
            throw new Error('Not implemented');
        },
        getUserById: async (userId: string) => {
            const { data } = await api.users.getUserById(userId);
            return data;
        },
        getSpaceById: async (spaceId: string, shareKey: string | undefined) => {
            const { data } = await api.spaces.getSpaceById(spaceId, { shareKey });
            return data;
        },
        getCollection: async (collectionId: string) => {
            const { data } = await api.collections.getCollectionById(collectionId);
            return data;
        },
        getReusableContent: async (spaceId: string, revisionId: string, reusableContentId: string) => {
            const { data } = await api.spaces.getReusableContentInRevisionById(spaceId, revisionId, reusableContentId);
            return data;
        },
    };
}

function getURLFromParams(input: string[]) {
    const url = new URL('https://' + input.join('/'));
    return url.toString();
}
