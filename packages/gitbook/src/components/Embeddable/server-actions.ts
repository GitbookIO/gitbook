'use server';

import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
import { withTrailingSlash } from '@/lib/paths';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceByUrl } from '@/lib/sites';
import { traceErrorOnly } from '@/lib/tracing';

/**
 * Resolve a `navigateToPage` reference into the embed link for that page.
 *
 * The reference can be a page path relative to the docs root
 * (e.g. `getting-started/quickstart` or `/help-center/integrations`) or the full
 * published URL. Paths are resolved relative to the site's published URL, so a
 * leading slash means "from the docs root" even when the site is served from a
 * subdirectory (e.g. `example.com/docs`).
 *
 * On a multi-space site the target may live in a different space/section than the one
 * the embed is currently showing, and the section base must go *before*
 * `~gitbook/embed/page` (e.g. `/help-center/~gitbook/embed/page/integrations`). We find
 * the space that owns the target from the site structure and build the link with the
 * embeddable linker, so a cross-space deep link resolves instead of 404ing.
 */
export async function resolveEmbedPageLink(
    reference: string
): Promise<{ href: string } | { error: string }> {
    return traceErrorOnly('Embed.resolveEmbedPageLink', async () => {
        const baseContext = await getServerActionBaseContext();
        const context = await fetchServerActionSiteContext(baseContext);

        // Use the site's published URL (not the linker's, which is proxy-prefixed in
        // `/url/...` mode) so the reference matches the spaces' published URLs.
        const sitePublishedURL = context.site.urls.published;
        if (!sitePublishedURL) {
            return { error: 'The site has no published URL.' };
        }

        // Resolve the reference to a full URL within the published site. Strip a leading
        // slash so an absolute-looking path is treated as relative to the docs root
        // rather than the domain root (which matters when the site is on a subdirectory).
        let target: URL;
        try {
            target = new URL(reference.replace(/^\/+/, ''), withTrailingSlash(sitePublishedURL));
        } catch {
            return { error: `Invalid page reference: ${reference}` };
        }

        // Find the space that owns the target and the page path within it, then build the
        // embed link so the section base lands before `~gitbook/embed/page`.
        const match = findSiteSpaceByUrl(context.structure, target.href);
        const spacePublishedURL = match?.siteSpace.urls.published;
        if (!match || !spacePublishedURL) {
            return { error: `Could not resolve a page for "${reference}".` };
        }

        const href = toEmbeddableLinkForPublishedContent(
            context.linker,
            spacePublishedURL,
            match.pagePath ?? ''
        );
        // Carry through a section anchor (e.g. `#install`) from the reference.
        return { href: `${href}${target.hash}` };
    });
}
