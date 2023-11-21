import 'server-only';

import { RevisionPageDocument } from '@gitbook/api';
import { headers } from 'next/headers';

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
 * Return the base URL for the current request.
 */
export function baseUrl(): string {
    return `https://${host()}${basePath()}`;
}

/**
 * Create an absolute href in the current content.
 */
export function absoluteHref(href: string): string {
    const base = basePath();
    return `${base}${href.startsWith('/') ? href.slice(1) : href}`;
}

/**
 * Create a link to a page path in the current space.
 */
export function pageHref(
    page: RevisionPageDocument,
    context: PageHrefContext = {},
    /** Anchor to link to in the page. */
    anchor?: string,
): string {
    const { pdf } = context;

    if (pdf) {
        if (pdf.includes(page.id)) {
            return '#' + pagePDFContainerId(page, anchor);
        } else {
            // Use an absolute URL to the page
            // TODO: we need to extend RevisionPageDocument with "urls"
            return page.urls?.published || '/todo';
        }
    }

    return absoluteHref(page.path) + (anchor ? '#' + anchor : '');
}

/**
 * Create the HTML ID for the container of a page during a PDF rendering.
 */
export function pagePDFContainerId(page: RevisionPageDocument, anchor?: string): string {
    return `pdf-page-${page.id}` + (anchor ? `-${anchor}` : '');
}

/**
 * Create an HTML ID for a block in a page.
 * It ensures the ID is unique in the entire HTML page (in case we are generating a PDF with multiple pages).
 */
export function pageLocalId(
    page: RevisionPageDocument,
    localId: string,
    context: PageHrefContext,
): string {
    if (!context.pdf?.length) {
        return localId;
    }

    return pagePDFContainerId(page, localId);
}
