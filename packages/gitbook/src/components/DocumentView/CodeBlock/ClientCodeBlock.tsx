'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useRef, useState } from 'react';

import { useInViewportListener } from '@/components/hooks/useInViewportListener';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { useDebounceCallback, useEventCallback } from 'usehooks-ts';
import type { BlockProps } from '../Block';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import type { HighlightLine, RenderedInline } from './highlight';
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
    const processedRef = useRef(false);
    const isInViewportRef = useRef<boolean | null>(null);
    const [lines, setLines] = useState<HighlightLine[]>(() => plainHighlight(block, []));

    // Preload the highlighter when the block is mounted.
    useEffect(() => {
        import('./highlight').then(({ preloadHighlight }) => preloadHighlight(block));
    }, [block]);

    const runHighlight = useEventCallback(() => {
        if (processedRef.current) {
            return;
        }
        if (typeof window !== 'undefined') {
            import('./highlight').then(({ highlight }) => {
                highlight(block, inlines).then((lines) => {
                    setLines(lines);
                    processedRef.current = true;
                });
            });
        }
    });
    const debouncedRunHighlight = useDebounceCallback(runHighlight, 1000);

    useInViewportListener(
        blockRef,
        (isInViewport, disconnect) => {
            // Disconnect once in viewport
            if (isInViewport) {
                disconnect();
                // If it's initially in viewport, we need to run the highlight
                if (isInViewportRef.current === null) {
                    runHighlight();
                }
            }
            isInViewportRef.current = isInViewport;
        },
        { rootMargin: '200px' }
    );

    const handleScroll = useDebounceCallback(() => {
        if (isInViewportRef.current) {
            debouncedRunHighlight();
        }
    }, 80);

    useScrollListener(handleScroll, useRef(typeof window !== 'undefined' ? window : null));

    return <CodeBlockRenderer ref={blockRef} block={block} style={style} lines={lines} />;
}
