import { fetchSiteContextByURL } from '@v2/lib/context';
import { createDataFetcher } from '@v2/lib/data';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_URL } from '@v2/lib/env';
import { createImageResizer } from '@v2/lib/images';
import { createLinker } from '@v2/lib/links';
import { headers } from 'next/headers';

export type RouteParamMode = 'url-host' | 'url';

export type RouteLayoutParams = {
    mode: string;

    /** URL encoded site URL */
    siteURL: string;
};

export type RouteParams = RouteLayoutParams & {
    pagePath: string;
};

/**
 * Get the static context when rendering statically a site.
 */
export async function getStaticSiteContext(params: RouteLayoutParams) {
    const url = getSiteURLFromParams(params);

    const dataFetcher = createDataFetcher();
    const { linker, host } = createLinkerFromParams(params);
    const context = await fetchSiteContextByURL(
        {
            dataFetcher,
            linker,
        },
        {
            url: url.toString(),
            visitorAuthToken: null,
            redirectOnError: false,
        }
    );

    context.imageResizer = createImageResizer({
        host,
        linker: context.linker,
    });

    return context;
}

/**
 * Get the site context when rendering dynamically.
 * The context will depend on the request.
 */
export async function getDynamicSiteContext(params: RouteLayoutParams) {
    const url = getSiteURLFromParams(params);
    const headersSet = await headers();

    const dataFetcher = createDataFetcher({
        apiToken: headersSet.get('x-gitbook-token') ?? GITBOOK_API_TOKEN,
        apiEndpoint: headersSet.get('x-gitbook-api') ?? GITBOOK_API_URL,
    });

    const { linker, host } = createLinkerFromParams(params);

    const context = await fetchSiteContextByURL(
        {
            dataFetcher,
            linker,
        },
        {
            url: url.toString(),
            visitorAuthToken: headersSet.get('x-gitbook-visitor-token'),

            // TODO: set it only when the token comes from the cookies.
            redirectOnError: true,
        }
    );

    context.imageResizer = createImageResizer({
        host,
        linker: context.linker,
    });

    return context;
}

/**
 * Get the decoded page path from the params.
 */
export function getPagePathFromParams(params: RouteParams) {
    const decoded = decodeURIComponent(params.pagePath);
    return decoded;
}

function createLinkerFromParams(params: RouteLayoutParams) {
    const url = getSiteURLFromParams(params);
    const mode = getModeFromParams(params.mode);

    if (mode === 'url-host') {
        return {
            linker: createLinker({
                host: url.host,
                pathname: '/',
            }),
            host: url.host,
        };
    }

    const gitbookURL = new URL(GITBOOK_URL);
    const linker = createLinker({
        protocol: gitbookURL.protocol,
        host: gitbookURL.host,
        pathname: `/url/${url.host}`,
    });

    // Create link in the same format for links to other sites/sections.
    linker.toLinkForContent = (rawURL: string) => {
        const urlObject = new URL(rawURL);
        return `/url/${urlObject.host}${urlObject.pathname}`;
    };

    return {
        linker,
        host: gitbookURL.host,
    };
}

function getSiteURLFromParams(params: RouteLayoutParams) {
    const decoded = decodeURIComponent(params.siteURL);
    const url = new URL(`https://${decoded}`);
    return url;
}

function getModeFromParams(mode: string): RouteParamMode {
    if (mode === 'url-host') {
        return 'url-host';
    }

    return 'url';
}
