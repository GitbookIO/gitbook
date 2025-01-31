'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useRef, useState } from 'react';

import { useHasBeenInViewport } from '@/components/hooks/useHasBeenInViewport';

import type { HighlightLine, RenderedInline } from './highlight';
import type { BlockProps } from '../Block';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { plainHighlight } from './plain-highlight';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    inlines: RenderedInline[];
};

/**
 * Render a code-block client-side by loading the highlighter asynchronously.
 * It allows us to defer some load to avoid blocking the rendering of the whole page with block highlighting.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { block, style, inlines } = props;
    const blockRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<HighlightLine[]>(() => plainHighlight(block, []));

    // We preload the highlighter as soon as possible during the first render.
    preloadHighlight(block);

    // Check if the block is in the viewport to start highlighting it.
    const hasBeenInViewport = useHasBeenInViewport(blockRef, {
        rootMargin: '200px',
    });

    // Highlight the block when it's in the viewport.
    useEffect(() => {
        if (hasBeenInViewport) {
            let canceled = false;
            lazyHighlight(block, inlines).then((lines) => {
                if (!canceled) {
                    setLines(lines);
                }
            });
            return () => {
                canceled = true;
            };
        }
    }, [hasBeenInViewport, block, inlines]);

    return <CodeBlockRenderer ref={blockRef} block={block} style={style} lines={lines} />;
}

const IS_SERVER = typeof window === 'undefined';

const preloaded = new WeakSet<DocumentBlockCode>();
/**
 * Preload the highlighter.
 */
function preloadHighlight(block: DocumentBlockCode) {
    if (IS_SERVER) {
        return;
    }

    if (preloaded.has(block)) {
        return;
    }
    preloaded.add(block);
    import('./highlight').then(({ preloadHighlight }) => preloadHighlight(block)).catch(() => {});
}

/**
 * Highlight a block in a lazy way, highlighter is loaded asynchronously.
 */
async function lazyHighlight(...args: Parameters<(typeof import('./highlight'))['highlight']>) {
    const { highlight } = await import('./highlight');
    // We use requestIdleCallback to avoid blocking the main thread when scrolling for example.
    if (typeof requestIdleCallback === 'function') {
        return new Promise<HighlightLine[]>((resolve, reject) => {
            requestIdleCallback(() => highlight(...args).then(resolve, reject));
        });
    }
    return highlight(...args);
}
