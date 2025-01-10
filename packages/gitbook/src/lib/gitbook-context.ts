import { headers } from 'next/headers';

import { DEFAULT_API_ENDPOINT } from './api';
import { formatBasePath } from './links';

export type GitBookContext = {
    theme: string | null;
    nonce: string | null;
    visitorToken: string | null;
    trackPageViews: boolean;
    apiEndpoint: string;
    apiToken: string | null;
    apiTokenContextId: string | null;
    customization: string | null;
    host: string;
    basePath: string;
    protocol: string;
    originBasePath: string;

    // Content pointers
    spaceId: string | null;
    siteId: string | null;
    organizationId: string | null;
    siteSpaceId: string | null;
    siteSectionId: string | null;
    siteShareKey: string | null;
    contentRevisionId: string | null;
    changeRequestId: string | null;

    // Indexation
    searchIndexation: boolean;
};

/**
 * Extract the gitbook context from the headers.
 */
export function getGitBookContextFromHeaders(headers: Headers): GitBookContext {
    return {
        theme: headers.get('x-gitbook-theme'),
        nonce: headers.get('x-nonce'),
        visitorToken: headers.get('x-gitbook-visitor-token'),
        trackPageViews: headers.has('x-gitbook-track-page-views'),
        apiEndpoint: headers.get('x-gitbook-api') ?? DEFAULT_API_ENDPOINT,
        apiToken: headers.get('x-gitbook-token'),
        apiTokenContextId: headers.get('x-gitbook-token-context'),
        customization: headers.get('x-gitbook-customization'),
        basePath: formatBasePath(headers.get('x-gitbook-basepath')),
        host: headers.get('x-gitbook-host') ?? headers.get('host') ?? '',
        protocol: headers.get('x-forwarded-proto') ?? 'https',
        originBasePath: headers.get('x-gitbook-origin-basepath') ?? '/',
        spaceId: headers.get('x-gitbook-content-space'),
        siteId: headers.get('x-gitbook-content-site'),
        organizationId: headers.get('x-gitbook-content-organization'),
        siteSpaceId: headers.get('x-gitbook-content-site-space'),
        siteSectionId: headers.get('x-gitbook-content-site-section'),
        siteShareKey: headers.get('x-gitbook-content-site-share-key'),
        contentRevisionId: headers.get('x-gitbook-content-revision'),
        changeRequestId: headers.get('x-gitbook-content-changerequest'),
        searchIndexation: headers.has('x-gitbook-search-indexation'),
    };
}

export type IpAndUserAgent = {
    ip: string;
    userAgent: string;
};

/**
 * Read the IP and User-Agent from the headers.
 * This function can only be called at the top level of a component or route.
 */
export function getIpAndUserAgentFromHeaders(headers: Headers): IpAndUserAgent {
    const ip =
        headers.get('x-gitbook-ipv4') ??
        headers.get('x-gitbook-ip') ??
        headers.get('cf-pseudo-ipv4') ??
        headers.get('cf-connecting-ip') ??
        headers.get('x-forwarded-for') ??
        '';
    const userAgent = headers.get('user-agent') ?? '';

    return { ip, userAgent };
}
