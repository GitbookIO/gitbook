'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { useAdaptiveVisitor } from '@/components/Adaptive';
import { useInViewportListener } from '@/components/hooks/useInViewportListener';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { Button, ToggleChevron } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
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
    mode: BlockProps<DocumentBlockCode>['context']['mode'];
};

export const CODE_BLOCK_DEFAULT_COLLAPSED_LINE_COUNT = 10;

/**
 * Render a code-block client-side by loading the highlighter asynchronously.
 * It allows us to defer some load to avoid blocking the rendering of the whole page with block highlighting.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { block, mode, style, inlines, inlineExprVariables } = props;
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

    const numberOfLinesOfCode = lines?.length ?? plainLines.length;
    const collapsedLineCount =
        block.data.collapsedLineCount || CODE_BLOCK_DEFAULT_COLLAPSED_LINE_COUNT;
    const isExpandable = Boolean(
        expandable && mode !== 'print' && numberOfLinesOfCode > collapsedLineCount
    );

    const codeBlockBodyId = useId();

    const renderer = (
        <CodeBlockRenderer
            ref={blockRef}
            aria-busy={highlighting}
            block={block}
            style={style}
            lines={lines ?? plainLines}
            id={codeBlockBodyId}
        />
    );

    return isExpandable ? (
        <CodeBlockExpandable
            lines={lines ?? plainLines}
            controls={codeBlockBodyId}
            collapsedLineCount={collapsedLineCount}
        >
            {renderer}
        </CodeBlockExpandable>
    ) : (
        renderer
    );
}

function CodeBlockExpandable(props: {
    children: React.ReactNode;
    lines: HighlightLine[];
    collapsedLineCount: number;
    controls?: string;
}) {
    const { children, controls, lines = [], collapsedLineCount } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const language = useLanguage();
    return (
        <div className="group/codeblock-expandable relative">
            <div
                className={tcls(
                    isExpanded
                        ? '[&_pre]:after:opacity-0'
                        : '[&_pre]:h-[calc(2rem+var(--line-count)*var(--line-height))] [&_pre]:overflow-y-hidden [&_pre]:after:opacity-100',
                    '[&_pre]:after:pointer-events-none [&_pre]:after:absolute [&_pre]:after:inset-0 [&_pre]:after:z-1 [&_pre]:after:bg-gradient-to-t [&_pre]:after:from-0% [&_pre]:after:from-tint-2 [&_pre]:after:to-70% [&_pre]:after:to-transparent [&_pre]:after:content-[""]'
                )}
                style={
                    {
                        '--line-count': collapsedLineCount,
                        '--line-height': '1.25rem',
                    } as React.CSSProperties
                }
            >
                {children}
            </div>
            <div className="pointer-events-none absolute bottom-0 flex w-full justify-center">
                <Button
                    icon={<ToggleChevron open={isExpanded} />}
                    size="xsmall"
                    variant="blank"
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="pointer-events-auto z-1 my-2 text-primary text-sm opacity-0 focus:opacity-11 group-hover/codeblock-expandable:opacity-11"
                    aria-expanded={isExpanded}
                    aria-controls={controls}
                >
                    {isExpanded
                        ? t(language, 'code_block_expanded')
                        : t(language, 'code_block_collapsed', lines.length)}
                </Button>
            </div>
        </div>
    );
}
