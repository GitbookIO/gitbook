import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { GitBookAPI } from '@gitbook/api';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@/lib/env';

/**
 * Generic context about rendering content.
 */
export interface GitBookContext {
    /**
     * API client to fetch data from GitBook.
     */
    api: GitBookAPI;
}

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
 * Create a site context, when rendering a static page.
 */
export async function createStaticSiteContext(url: string[]): Promise<GitBookSiteContext> {
    const context = createStaticContext();
    return fetchSiteContext(url, context);
}

/**
 * Create a site context, when rendering a dynamic page.
 */
export async function createDynamicSiteContext(url: string[]): Promise<GitBookSiteContext> {
    const context = await createDynamicContext();
    return fetchSiteContext(url, context);
}

/**
 * Fetch the context of a site for a given URL and a base context.
 */
async function fetchSiteContext(urlParts: string[], baseContext: GitBookContext): Promise<GitBookSiteContext> {
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

    return {
        api,
    };
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

    return {
        api,
    };
}

function getURLFromParams(input: string[]) {
    const url = new URL('https://' + input.join('/'));
    return url.toString();
}
