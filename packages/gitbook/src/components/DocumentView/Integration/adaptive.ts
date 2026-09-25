import type { GitBookAnyContext } from '@/lib/context';

/**
 * Current page exposed to a webframe through the client-only webframe state.
 */
export type WebframePageContext = {
    id: string;
    /** Path of the page relative to the site root (includes the section and variant). */
    path: string;
    title: string;
};

/**
 * Extract the current page to expose to a webframe, or `null` when it is unknown
 * (e.g. a non-page context, or reusable content resolved from another source).
 *
 * The exposed `path` is resolved relative to the site root — so it carries the section and
 * variant, unlike the space-relative `page.path` — matching how `@webframe.navigate` resolves a
 * path. A webframe can pass `page.path` straight back to the navigate action.
 */
export function getWebframePageContext(
    contentContext: GitBookAnyContext
): WebframePageContext | null {
    if (!('page' in contentContext) || !contentContext.page) {
        return null;
    }

    const { linker } = contentContext;
    const { id, path, title } = contentContext.page;

    return {
        id,
        path: linker.toRelativePathInSite(linker.toPathInSpace(path)),
        title,
    };
}
