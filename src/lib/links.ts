import 'server-only';

import { headers } from 'next/headers';

/**
 * Create a link to a page path in the current space.
 */
export function pageHref(pagePath: string): string {
    const headersList = headers();
    const basePath = headersList.get('x-gitbook-basepath') ?? '';

    return `${basePath}/${pagePath.startsWith('/') ? pagePath.slice(1) : pagePath}`;
}
