'use server';

import { resolveContentRef, resolveStringContentRef } from '@/lib/references';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
import { toInSiteHref } from '../navigation';

/**
 * Resolve a link provided by the assistant into a path that can be navigated to within the site.
 *
 * The assistant references pages using the stable content-ref scheme (e.g.
 * `/spaces/<spaceId>/pages/<pageId>`). Those URLs are not directly navigable in the published
 * site, so we resolve them to the real site link using the site context. Any other URL is only
 * accepted if it points within the current site, so the assistant cannot navigate the reader off
 * the documentation site.
 */
export async function resolveAINavigationLink(
    url: string
): Promise<{ href: string } | { error: string }> {
    return traceErrorOnly('AI.resolveAINavigationLink', async () => {
        const baseContext = await getServerActionBaseContext();
        const context = await fetchServerActionSiteContext(baseContext);

        // The content-ref scheme operates on the path portion of the URL. Strip any origin so an
        // absolute URL (e.g. `https://docs.example.com/spaces/.../pages/...`) is handled too.
        let path = url;
        if (URL.canParse(url)) {
            const parsed = new URL(url);
            path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }

        const contentRef = resolveStringContentRef(path);
        if (contentRef) {
            const resolved = await resolveContentRef(contentRef, context);
            if (!resolved) {
                return { error: `Could not resolve page for ${url}` };
            }
            return { href: resolved.href };
        }

        // Not a content reference: only navigate to it if it points within the current site.
        const inSiteHref = toInSiteHref(url, context.linker);
        if (!inSiteHref) {
            return { error: 'Cannot navigate to a page outside of this documentation site.' };
        }
        return { href: inSiteHref };
    });
}
