'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useRef, useState } from 'react';

import { useHasBeenInViewport } from '@/components/hooks/useHasBeenInViewport';

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
    const [lines, setLines] = useState<HighlightLine[]>(() => plainHighlight(block, []));

    // Preload the highlighter when the block is mounted.
    useEffect(() => {
        import('./highlight').then(({ preloadHighlight }) => preloadHighlight(block));
    }, [block]);

    // Check if the block is in the viewport to start highlighting it.
    const hasBeenInViewport = useHasBeenInViewport(blockRef, {
        rootMargin: '200px',
    });

    // Highlight the block when it's in the viewport.
    useEffect(() => {
        if (hasBeenInViewport) {
            let canceled = false;
            import('./highlight').then(({ highlight }) => {
                // We use requestIdleCallback to avoid blocking the main thread
                // when scrolling.
                if (typeof requestIdleCallback === 'function') {
                    requestIdleCallback(() =>
                        highlight(block, inlines).then((result) => {
                            if (!canceled) {
                                setLines(result);
                            }
                        })
                    );
                } else {
                    highlight(block, inlines).then((result) => {
                        if (!canceled) {
                            setLines(result);
                        }
                    });
                }
            });
            return () => {
                canceled = true;
            };
        }
    }, [hasBeenInViewport, block, inlines]);

    return <CodeBlockRenderer ref={blockRef} block={block} style={style} lines={lines} />;
}
