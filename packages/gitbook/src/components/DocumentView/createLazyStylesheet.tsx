'use client';

/**
 * Factory for a fire-and-forget loader of a code-split stylesheet: the CSS only downloads on
 * pages that render the associated block, instead of shipping in every page's CSS chunk. The
 * returned component renders nothing.
 */
export function createLazyStylesheet(load: () => Promise<unknown>) {
    let loaded = false;
    return function LazyStylesheet() {
        // Load during render (not in an effect) so the request starts as early as possible.
        if (!loaded && typeof window !== 'undefined') {
            loaded = true;
            load();
        }
        return null;
    };
}
