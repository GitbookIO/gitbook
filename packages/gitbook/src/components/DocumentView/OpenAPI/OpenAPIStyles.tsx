'use client';

/**
 * Lazy-loads the OpenAPI/Scalar stylesheet. Kept out of the static import graph so the
 * ~148KB Scalar CSS only downloads on pages that actually render an OpenAPI block.
 */
export default function OpenAPIStyles() {
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

    import('./style.css');
}
