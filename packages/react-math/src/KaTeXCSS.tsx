'use client';

/**
 * Dummy component to lazy load the KaTeX CSS.
 */
export default function KaTeXCSS(props: {}) {
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
    import('katex/dist/katex.min.css').then(() => {
        document.body.classList.add('katex-loaded');
    });
}
