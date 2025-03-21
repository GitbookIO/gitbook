import 'server-only';

import {
    type RevisionPage,
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { GITBOOK_APP_URL } from '@v2/lib/env';
import { getPagePath } from './pages';
import { withLeadingSlash, withTrailingSlash } from './paths';
import { assertIsNotV2 } from './v2';

export interface PageHrefContext {
    /**
     * If defined, we are generating a PDF of the specific page IDs,
     * and these pages will be rendered in the same HTML output.
     */
    pdf?: string[];
}

/**
 * Return the base path for the current request.
 * The value will start and finish with /
 */
export async function getBasePath(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const path = headersList.get('x-gitbook-basepath') ?? '/';

    return withTrailingSlash(withLeadingSlash(path));
}

/**
 * Return the site base path for the current request.
 * The value will start and finish with /
 */
export async function getSiteBasePath(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const path = headersList.get('x-gitbook-site-basepath') ?? '/';

    return withTrailingSlash(withLeadingSlash(path));
}

/**
 * Return the current host for the current request.
 */
export async function getHost(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const mode = headersList.get('x-gitbook-mode');
    if (mode === 'proxy') {
        return headersList.get('x-forwarded-host') ?? '';
    }

    return headersList.get('x-gitbook-host') ?? headersList.get('host') ?? '';
}

/**
 * Return the root URL for the GitBook Open instance (not the content).
 * Use `baseUrl` to get the base URL for the current content.
 *
 * The URL will end with "/".
 */
export async function getRootUrl(): Promise<string> {
    assertIsNotV2();
    const [headersList, host] = await Promise.all([headers(), getHost()]);
    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    let path = headersList.get('x-gitbook-origin-basepath') ?? '/';

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    if (!path.endsWith('/')) {
        path = `${path}/`;
    }

    return `${protocol}://${host}${path}`;
}

/**
 * Return the base URL for the current content.
 * The URL will end with "/".
 */
export async function getBaseUrl(): Promise<string> {
    assertIsNotV2();
    const [headersList, host, basePath] = await Promise.all([headers(), getHost(), getBasePath()]);
    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host}${basePath}`;
}

/**
 * Create an absolute href in the current content.
 */
export async function getAbsoluteHref(href: string, withHost = false): Promise<string> {
    assertIsNotV2();
    const base = withHost ? await getBaseUrl() : await getBasePath();
    return `${base}${href.startsWith('/') ? href.slice(1) : href}`;
}

/**
 * Create an absolute href in the GitBook application.
 */
export function getGitbookAppHref(pathname: string): string {
    const appUrl = new URL(GITBOOK_APP_URL);
    appUrl.pathname = pathname;

    return appUrl.toString();
}

/**
 * Create a link to a page path in the current space.
 */
export async function getPageHref(
    rootPages: RevisionPage[],
    page: RevisionPageDocument | RevisionPageGroup,
    context: PageHrefContext = {},
    /** Anchor to link to in the page. */
    anchor?: string
): Promise<string> {
    assertIsNotV2();
    const { pdf } = context;

    if (pdf) {
        if (pdf.includes(page.id)) {
            return `#${getPagePDFContainerId(page, anchor)}`;
        }
        if (page.type === RevisionPageType.Group) {
            return '#';
        }

        // Use an absolute URL to the page
        return page.urls.app;
    }

    const href =
        (await getAbsoluteHref(getPagePath(rootPages, page))) + (anchor ? `#${anchor}` : '');
    return href;
}

/**
 * Create the HTML ID for the container of a page during a PDF rendering.
 */
export function getPagePDFContainerId(
    page: RevisionPageDocument | RevisionPageGroup,
    anchor?: string
): string {
    return `pdf-page-${page.id}${anchor ? `-${anchor}` : ''}`;
}
