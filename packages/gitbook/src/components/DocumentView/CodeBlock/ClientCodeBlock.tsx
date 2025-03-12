'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useInViewportListener } from '@/components/hooks/useInViewportListener';
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
    const [isInViewport, setIsInViewport] = useState(false);
    const plainLines = useMemo(() => plainHighlight(block, []), [block]);
    const [lines, setLines] = useState<null | HighlightLine[]>(null);

    // Preload the highlighter when the block is mounted.
    useEffect(() => {
        import('./highlight').then(({ preloadHighlight }) => preloadHighlight(block));
    }, [block]);

    // Detect when the block is in viewport
    useInViewportListener(
        blockRef,
        (isInViewport, disconnect) => {
            if (isInViewport) {
                // Disconnect once in viewport
                disconnect();
                setIsInViewport(true);
            }
        },
        { rootMargin: '200px' }
    );

    // When the block is visible or updated, we need to re-run the highlight
    useEffect(() => {
        if (isInViewport) {
            // If the block is in viewport, we need to run the highlight
            let cancelled = false;

            if (typeof window !== 'undefined') {
                import('./highlight').then(({ highlight }) => {
                    highlight(block, inlines).then((lines) => {
                        if (cancelled) {
                            return;
                        }

                        setLines(lines);
                    });
                });
            }

            return () => {
                cancelled = true;
            };
        }

        // Otherwise if the block is not in viewport, we reset to the plain lines
        setLines(null);
    }, [isInViewport, block, inlines]);

    return (
        <CodeBlockRenderer ref={blockRef} block={block} style={style} lines={lines ?? plainLines} />
    );
}
