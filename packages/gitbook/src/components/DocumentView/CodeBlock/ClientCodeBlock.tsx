'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { useInViewportListener } from '@/components/hooks/useInViewportListener';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { Button } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { useDebounceCallback } from 'usehooks-ts';
import type { BlockProps } from '../Block';
import { type InlineExpressionVariables, useEvaluateInlineExpression } from '../InlineExpression';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import type { HighlightLine, RenderedInline } from './highlight';
import { plainHighlight } from './plain-highlight';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    inlines: RenderedInline[];
    inlineExprVariables: InlineExpressionVariables;
};

/**
 * Render a code-block client-side by loading the highlighter asynchronously.
 * It allows us to defer some load to avoid blocking the rendering of the whole page with block highlighting.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { block, style, inlines, inlineExprVariables } = props;
    const blockRef = useRef<HTMLDivElement>(null);
    const isInViewportRef = useRef(false);
    const [isInViewport, setIsInViewport] = useState(false);

    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    const visitorClaims = getAdaptiveVisitorClaims();
    const evaluateInlineExpression = useEvaluateInlineExpression({
        visitorClaims,
        variables: inlineExprVariables,
    });
    const plainLines = useMemo(
        () => plainHighlight(block, inlines, { evaluateInlineExpression }),
        [block, inlines, evaluateInlineExpression]
    );
    const [lines, setLines] = useState<null | HighlightLine[]>(null);
    const [highlighting, setHighlighting] = useState(false);

    // Preload the highlighter when the block is mounted.
    useEffect(() => {
        import('./highlight').then(({ preloadHighlight }) => preloadHighlight(block));
    }, [block]);

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
                setHighlighting(true);
                import('./highlight').then(({ highlight }) => {
                    highlight(block, inlines, { evaluateInlineExpression }).then((lines) => {
                        if (cancelled) {
                            return;
                        }

                        setLines(lines);
                        setHighlighting(false);
                    });
                });
            }

            return () => {
                cancelled = true;
            };
        }

        // Otherwise if the block is not in viewport, we reset to the plain lines
        setLines(null);
    }, [isInViewport, block, inlines, evaluateInlineExpression]);

    const expandable = block.data.expandable;

    const renderer = (
        <CodeBlockRenderer
            ref={blockRef}
            aria-busy={highlighting}
            block={block}
            style={style}
            lines={lines ?? plainLines}
        />
    );

    return expandable ? (
        <CodeBlockExpandable lines={lines ?? plainLines}>{renderer}</CodeBlockExpandable>
    ) : (
        <>{renderer}</>
    );
}

function CodeBlockExpandable(props: { children: React.ReactNode; lines: HighlightLine[] }) {
    const { children, lines = [] } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <div
                className={tcls(
                    isExpanded ? 'after:opacity-0' : 'h-60 overflow-y-hidden after:opacity-100',
                    'after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-t after:from-0% after:from-tint-2 after:to-70% after:to-transparent after:content-[""] motion-safe:transition-[height] motion-safe:delay-100 motion-safe:duration-100'
                )}
            >
                {children}
            </div>
            <div className="absolute bottom-0 flex w-full justify-center">
                <Button
                    icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size="xsmall"
                    variant="blank"
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="my-2 text-primary text-sm"
                >
                    {isExpanded ? 'Show less' : `Show all ${lines.length} lines`}
                </Button>
            </div>
        </div>
    );
}
