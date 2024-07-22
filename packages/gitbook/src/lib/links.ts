import 'server-only';

import {
    RevisionPage,
    RevisionPageDocument,
    RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { getPagePath } from './pages';

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
export function basePath(): string {
    const headersList = headers();
    let path = headersList.get('x-gitbook-basepath') ?? '/';

    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    if (!path.endsWith('/')) {
        path = path + '/';
    }

    return path;
}

/**
 * Return the current host for the current request.
 */
export function host(): string {
    const headersList = headers();
    return headersList.get('x-gitbook-host') ?? headersList.get('host') ?? '';
}

/**
 * Return the root URL for the GitBook Open instance (not the content).
 * Use `baseUrl` to get the base URL for the current content.
 *
 * The URL will end with "/".
 */
export function rootUrl(): string {
    const headersList = headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    let path = headersList.get('x-gitbook-origin-basepath') ?? '/';

    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    if (!path.endsWith('/')) {
        path = path + '/';
    }

    return `${protocol}://${host()}${path}`;
}

/**
 * Return the base URL for the current content.
 * The URL will end with "/".
 */
export function baseUrl(): string {
    const headersList = headers();
    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host()}${basePath()}`;
}

/**
 * Create an absolute href in the current content.
 */
export function absoluteHref(href: string, withHost: boolean = false): string {
    const base = withHost ? baseUrl() : basePath();
    return `${base}${href.startsWith('/') ? href.slice(1) : href}`;
}

/**
 * Create an absolute href in the GitBook application.
 */
export function gitbookAppHref(pathname: string): string {
    const appUrl = new URL(process.env.NEXT_PUBLIC_GITBOOK_APP_URL ?? `https://app.gitbook.com`);
    appUrl.pathname = pathname;

    return appUrl.toString();
}

/**
 * Create a link to a page path in the current space.
 */
export function pageHref(
    rootPages: RevisionPage[],
    page: RevisionPageDocument | RevisionPageGroup,
    context: PageHrefContext = {},
    /** Anchor to link to in the page. */
    anchor?: string,
): string {
    const { pdf } = context;

    if (pdf) {
        if (pdf.includes(page.id)) {
            return '#' + pagePDFContainerId(page, anchor);
        } else {
            if (page.type === RevisionPageType.Group) {
                return '#';
            }

            // Use an absolute URL to the page
            return page.urls.app;
        }
    }

    return absoluteHref(getPagePath(rootPages, page)) + (anchor ? '#' + anchor : '');
}

/**
 * Create the HTML ID for the container of a page during a PDF rendering.
 */
export function pagePDFContainerId(
    page: RevisionPageDocument | RevisionPageGroup,
    anchor?: string,
): string {
    return `pdf-page-${page.id}` + (anchor ? `-${anchor}` : '');
}
