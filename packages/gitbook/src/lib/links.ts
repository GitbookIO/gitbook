import 'server-only';

import {
    RevisionPage,
    RevisionPageDocument,
    RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { GitBookContext } from './gitbook-context';
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
export function formatBasePath(headerBasePath: string | null): string {
    let path = headerBasePath ?? '/';

    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    if (!path.endsWith('/')) {
        path = path + '/';
    }

    return path;
}

/**
 * Return the root URL for the GitBook Open instance (not the content).
 * Use `baseUrl` to get the base URL for the current content.
 *
 * The URL will end with "/".
 */
export function getRootUrl(ctx: GitBookContext): string {
    const protocol = ctx.protocol;
    let path = ctx.originBasePath;

    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    if (!path.endsWith('/')) {
        path = path + '/';
    }

    return `${protocol}://${ctx.host}${path}`;
}

/**
 * Return the base URL for the current content.
 * The URL will end with "/".
 */
export function getBaseUrl(ctx: GitBookContext): string {
    return `${ctx.protocol}://${ctx.host}${ctx.basePath}`;
}

/**
 * Create an absolute href in the current content.
 */
export function getAbsoluteHref(
    ctx: GitBookContext,
    href: string,
    withHost: boolean = false,
): string {
    const base = withHost ? getBaseUrl(ctx) : ctx.basePath;
    return `${base}${href.startsWith('/') ? href.slice(1) : href}`;
}

/**
 * Create an absolute href in the GitBook application.
 */
export function getGitbookAppHref(pathname: string): string {
    const appUrl = new URL(process.env.NEXT_PUBLIC_GITBOOK_APP_URL ?? `https://app.gitbook.com`);
    appUrl.pathname = pathname;

    return appUrl.toString();
}

/**
 * Create a link to a page path in the current space.
 */
export function getPageHref(
    ctx: GitBookContext,
    rootPages: RevisionPage[],
    page: RevisionPageDocument | RevisionPageGroup,
    context: PageHrefContext = {},
    /** Anchor to link to in the page. */
    anchor?: string,
): string {
    const { pdf } = context;

    if (pdf) {
        if (pdf.includes(page.id)) {
            return '#' + getPagePDFContainerId(page, anchor);
        } else {
            if (page.type === RevisionPageType.Group) {
                return '#';
            }

            // Use an absolute URL to the page
            return page.urls.app;
        }
    }

    return getAbsoluteHref(ctx, getPagePath(rootPages, page)) + (anchor ? '#' + anchor : '');
}

/**
 * Create the HTML ID for the container of a page during a PDF rendering.
 */
export function getPagePDFContainerId(
    page: RevisionPageDocument | RevisionPageGroup,
    anchor?: string,
): string {
    return `pdf-page-${page.id}` + (anchor ? `-${anchor}` : '');
}
