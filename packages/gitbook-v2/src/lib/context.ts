import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL } from '@v2/lib/env';
import { createDataFetcher, GitBookDataFetcher } from '@v2/lib/data';
import { Linker } from './links/types';

/**
 * Generic context about rendering content.
 */
export interface GitBookContext {
    /**
     * Data fetcher to fetch data from GitBook.
     */
    dataFetcher: GitBookDataFetcher;

    /**
     * Linker to generate links in the current site.
     */
    linker: Linker;
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

    /**
     * Share key of the site.
     */
    siteShareKey: string | undefined;
}

/**
 * Context when rendering a space content.
 */
export interface GitBookSpaceContext extends GitBookContext {
    /**
     * ID of the space.
     */
    spaceId: string;
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
async function fetchSiteContext(
    urlParts: string[],
    baseContext: GitBookContext,
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;
    const url = getURLFromParams(urlParts);
    const data = await dataFetcher.getPublishedContentByUrl({
        url,
    });

    if ('redirect' in data) {
        redirect(data.redirect);
    }

    return {
        ...baseContext,
        dataFetcher: createDataFetcher({
            apiEndpoint: dataFetcher.apiEndpoint,
            apiToken: data.apiToken,
        }),
        siteId: data.site,
        organizationId: data.organization,
        siteShareKey: data.shareKey,
    };
}

/**
 * Create the base context when rendering statically.
 */
function createStaticContext(): GitBookContext {
    return {
        dataFetcher: createDataFetcher(),
    };
}

/**
 * Create the base context when rendering dynamically.
 * The context will depend on the request.
 */
async function createDynamicContext(): Promise<GitBookContext> {
    const headersSet = await headers();

    return {
        dataFetcher: createDataFetcher({
            apiToken: headersSet.get('x-gitbook-token') ?? GITBOOK_API_TOKEN,
            apiEndpoint: headersSet.get('x-gitbook-api') ?? GITBOOK_API_URL,
        }),
    };
}

function getURLFromParams(input: string[]) {
    const url = new URL('https://' + input.join('/'));
    return url.toString();
}
