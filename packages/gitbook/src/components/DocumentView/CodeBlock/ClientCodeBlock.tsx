'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useInViewportListener } from '@/components/hooks/useInViewportListener';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { useDebounceCallback } from 'usehooks-ts';
import { CodeBlockRenderer, type CodeBlockRendererProps } from './CodeBlockRenderer';
import type { HighlightLine, RenderedInline } from './highlight';
import { plainHighlight } from './plain-highlight';
import type { LightNode } from './tree';

interface ClientBlockProps extends Omit<CodeBlockRendererProps, 'lines'> {
    lightNodes: LightNode[];
    inlines: RenderedInline[];
    syntax: string | undefined;
}

/**
 * Render a code-block client-side by loading the highlighter asynchronously.
 * It allows us to defer some load to avoid blocking the rendering of the whole page with block highlighting.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { lightNodes, style, inlines, syntax } = props;
    const blockRef = useRef<HTMLDivElement>(null);
    const isInViewportRef = useRef(false);
    const [isInViewport, setIsInViewport] = useState(false);
    const plainLines = useMemo(
        () => plainHighlight({ lightNodes, inlines: [], syntax }),
        [lightNodes, syntax]
    );
    const [lines, setLines] = useState<null | HighlightLine[]>(null);

    // Preload the highlighter when the block is mounted.
    useEffect(() => {
        import('./highlight').then(({ preloadHighlight }) => preloadHighlight(syntax));
    }, [syntax]);

    // When user scrolls, we need to wait for the scroll to finish before running the highlight
    const isScrollingRef = useRef(false);
    const onFinishScrolling = useDebounceCallback(() => {
        isScrollingRef.current = false;

        // If the block is in the viewport after the scroll, we need to run the highlight
        if (isInViewportRef.current) {
            setIsInViewport(true);
        }
    }, 100);
    useScrollListener(
        () => {
            isScrollingRef.current = true;
            onFinishScrolling();
        },
        useRef(typeof window !== 'undefined' ? window : null)
    );

    // Detect when the block is in viewport
    useInViewportListener(
        blockRef,
        (isInViewport, disconnect) => {
            isInViewportRef.current = isInViewport;
            if (isScrollingRef.current) {
                // If the user is scrolling, we don't want to run the highlight
                // because it will be run when the scroll is finished
                return;
            }

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
                    highlight({ lightNodes, inlines, syntax }).then((lines) => {
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
    }, [isInViewport, lightNodes, inlines, syntax]);

    return (
        <CodeBlockRenderer
            ref={blockRef}
            title={props.title}
            withLineNumbers={props.withLineNumbers}
            withWrap={props.withWrap}
            style={style}
            lines={lines ?? plainLines}
        />
    );
}
