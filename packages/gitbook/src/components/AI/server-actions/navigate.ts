'use server';

import { resolveContentRef, resolveStringContentRef } from '@/lib/references';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';

/**
 * Resolve a link provided by the assistant into a path that can be navigated to within the site.
 *
 * The assistant references pages using the stable content-ref scheme (e.g.
 * `/spaces/<spaceId>/pages/<pageId>`). Those URLs are not directly navigable in the published
 * site, so we resolve them to the real site link using the site context. URLs that are not
 * content references (e.g. an already-resolved site path) are returned unchanged.
 */
export async function resolveAINavigationLink(
    url: string
): Promise<{ href: string } | { error: string }> {
    return traceErrorOnly('AI.resolveAINavigationLink', async () => {
        // The content-ref scheme operates on the path portion of the URL. Strip any origin so an
        // absolute URL (e.g. `https://docs.example.com/spaces/.../pages/...`) is handled too.
        let path = url;
        if (URL.canParse(url)) {
            const parsed = new URL(url);
            path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }

        const contentRef = resolveStringContentRef(path);
        if (!contentRef) {
            // Not a content reference, navigate to the provided URL as-is.
            return { href: url };
        }

        const baseContext = await getServerActionBaseContext();
        const context = await fetchServerActionSiteContext(baseContext);

        const resolved = await resolveContentRef(contentRef, context);
        if (!resolved) {
            return { error: `Could not resolve page for ${url}` };
        }

        return { href: resolved.href };
    });
}
