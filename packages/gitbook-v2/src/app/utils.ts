import { fetchSiteContextByURL } from '@v2/lib/context';
import { createDataFetcher } from '@v2/lib/data';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL } from '@v2/lib/env';
import { createNoopImageResizer } from '@v2/lib/images';
import { createSpaceLinker } from '@v2/lib/links';
import { headers } from 'next/headers';

export type RouteParamMode = 'url-host' | 'url';

export interface RouteParams {
    url: string | string[];
    mode: string;
}

/**
 * Get the static context when rendering statically a site.
 */
export function getStaticSiteContext(params: RouteParams) {
    const url = getURLFromParams(params.url);

    const dataFetcher = createDataFetcher();
    const linker = createLinker(params);
    const imageResizer = createNoopImageResizer();

    return fetchSiteContextByURL(
        {
            dataFetcher,
            linker,
            imageResizer,
        },
        {
            url,
            visitorAuthToken: null,
            redirectOnError: false,
        },
    );
}

/**
 * Get the site context when rendering dynamically.
 * The context will depend on the request.
 */
export async function getDynamicSiteContext(params: RouteParams) {
    const url = getURLFromParams(params.url);
    const headersSet = await headers();

    const dataFetcher = createDataFetcher({
        apiToken: headersSet.get('x-gitbook-token') ?? GITBOOK_API_TOKEN,
        apiEndpoint: headersSet.get('x-gitbook-api') ?? GITBOOK_API_URL,
    });

    const linker = createLinker(params);
    const imageResizer = createNoopImageResizer();

    return fetchSiteContextByURL(
        {
            dataFetcher,
            linker,
            imageResizer,
        },
        {
            url,
            visitorAuthToken: headersSet.get('x-gitbook-visitor-token'),

            // TODO: set it only when the token comes from the cookies.
            redirectOnError: true,
        },
    );
}

function getURLFromParams(input: string | string[]) {
    const url = new URL('https://' + (Array.isArray(input) ? input.join('/') : input));
    return url.toString();
}

function getModeFromParams(mode: string): RouteParamMode {
    if (mode === 'url-host') {
        return 'url-host';
    }

    return 'url';
}

function createLinker(params: RouteParams) {
    const mode = getModeFromParams(params.mode);

    if (mode === 'url-host') {
        return createSpaceLinker({
            host: params.url[0],
            pathname: '/',
        });
    }

    return createSpaceLinker({
        host: '',
        pathname: `/url/${params.url[0]}`,
    });
}
