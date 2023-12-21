'use client';
import { createSuspenseCache } from '@/lib/suspense';

const cache = createSuspenseCache({
    load: async (args: []) => {
        // @ts-ignore
        await import('katex/dist/katex.min.css');
    },
});

/**
 * Dummy component to lazy load the KaTeX CSS.
 */
export default function KaTeXCSS(props: { children: React.ReactNode }) {
    cache.read();
    return <>{props.children}</>;
}
