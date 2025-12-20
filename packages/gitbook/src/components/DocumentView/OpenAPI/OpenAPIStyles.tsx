'use client';

/**
 * Dummy component to lazy load the OpenAPI CSS.
 */
export default function OpenAPIStyles() {
    // Load the CSS as soon as possible (this is why we don't use an effect hook here)
    // We lazy load the CSS to avoidNext bundling it in the main bundle
    loadCSS();

    return null;
}

let loaded = false;

function loadCSS() {
    if (loaded || typeof window === 'undefined') {
        return;
    }

    loaded = true;

    // @ts-ignore
    import('./style.css').then(() => {
        document.body.classList.add('openapi-styles-loaded');
    });
}
