'use client';
import React from 'react';

/**
 * Dummy component to lazy load the KaTeX CSS.
 */
export default function KaTeXCSS(props: {}) {
    React.useEffect(() => {
        // @ts-ignore
        import('katex/dist/katex.min.css');
    }, []);

    return null;
}
