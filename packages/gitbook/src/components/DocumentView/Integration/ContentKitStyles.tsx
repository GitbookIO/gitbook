'use client';

/**
 * Lazy-loads the ContentKit stylesheet so it only downloads on pages that actually render
 * an integration block, instead of shipping in every page's CSS chunk.
 */
export default function ContentKitStyles() {
    // Load the CSS as soon as possible (this is why we don't use an effect hook here).
    loadCSS();

    return null;
}

let loaded = false;

function loadCSS() {
    if (loaded || typeof window === 'undefined') {
        return;
    }

    loaded = true;

    import('./contentkit.css');
}
