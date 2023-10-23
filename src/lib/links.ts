import 'server-only';

import { headers } from 'next/headers';

/**
 * Return the base path for the current request.
 */
export function basePath(): string {
    const headersList = headers();
    return headersList.get('x-gitbook-basepath') ?? '';
}

/**
 * Create a link to a page path in the current space.
 */
export function pageHref(pagePath: string): string {
    return `${basePath()}/${pagePath.startsWith('/') ? pagePath.slice(1) : pagePath}`;
}
