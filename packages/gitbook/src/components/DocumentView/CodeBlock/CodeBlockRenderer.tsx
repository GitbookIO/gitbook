import type { DocumentBlockCode } from '@gitbook/api';
import assertNever from 'assert-never';
import { forwardRef, useId } from 'react';

import { tcls } from '@/lib/tailwind';

import { AnnotationPopover } from '../Annotation/AnnotationPopover';
import type { BlockProps } from '../Block';
import { CopyCodeButton } from './CopyCodeButton';
import type { HighlightLine, HighlightToken } from './highlight';

import './theme.css';
import './CodeBlockRenderer.css';

type CodeBlockRendererProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    lines: HighlightLine[];
};

/**
 * The logic of rendering a code block from lines.
 */
export const CodeBlockRenderer = forwardRef(function CodeBlockRenderer(
    props: CodeBlockRendererProps,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const { block, style, lines } = props;

    const id = useId();
    const withLineNumbers = Boolean(block.data.lineNumbers) && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;

    return (
        <div ref={ref} className={tcls('group/codeblock grid grid-flow-col', style)}>
            <div className="flex items-center justify-start gap-2 text-sm [grid-area:1/1]">
                {title ? (
                    <div className="inline-flex items-center justify-center rounded-t straight-corners:rounded-t-s bg-tint px-3 py-2 text-tint text-xs leading-none tracking-wide">
                        {title}
                    </div>
                ) : null}
            </div>
            <CopyCodeButton
                codeId={id}
                style="z-[2] mt-2 mr-2 self-start justify-self-end rounded-md bg-transparent p-1 text-tint text-xs leading-none opacity-0 ring-1 ring-tint backdrop-blur-md transition-opacity duration-75 [grid-area:2/1] hover:ring-tint-hover group-hover/codeblock:opacity-[1]"
            />
            <pre
                className={tcls(
                    'hide-scroll relative overflow-auto bg-tint theme-gradient:bg-tint-12/1 ring-tint-subtle [grid-area:2/1]',
                    'rounded-md straight-corners:rounded-sm',
                    title && 'rounded-ss-none'
                )}
            >
                <code
                    id={id}
                    className={tcls(
                        'inline-grid min-w-full grid-cols-[auto_1fr] p-2 [count-reset:line]',
                        withWrap && 'whitespace-pre-wrap'
                    )}
                >
                    {lines.map((line, index) => (
                        <CodeHighlightLine
                            key={index}
                            line={line}
                            isLast={index === lines.length - 1}
                            withLineNumbers={withLineNumbers}
                        />
                    ))}
                </code>
            </pre>
        </div>
    );
});

function CodeHighlightLine(props: {
    line: HighlightLine;
    isLast: boolean;
    withLineNumbers: boolean;
}) {
    const { line, isLast, withLineNumbers } = props;
    return (
        <span className={tcls('highlight-line', line.highlighted && 'highlighted')}>
            {withLineNumbers && <span className="highlight-line-number" />}
            <span className="highlight-line-content">
                <CodeHighlightTokens tokens={line.tokens} />
                {!isLast && '\n'}
            </span>
        </span>
    );
}

function CodeHighlightTokens(props: { tokens: HighlightToken[] }) {
    const { tokens } = props;
    return tokens.map((token, index) => <CodeHighlightToken key={index} token={token} />);
}

function CodeHighlightToken(props: { token: HighlightToken }) {
    const { token } = props;

    switch (token.type) {
        case 'annotation': {
            return (
                <AnnotationPopover body={token.body}>
                    <CodeHighlightTokens tokens={token.children} />
                </AnnotationPopover>
            );
        }
        case 'plain': {
            return token.content;
        }
        case 'shiki': {
            if (!token.token.color) {
                return token.token.content;
            }

            return <span style={{ color: token.token.color }}>{token.token.content}</span>;
        }
        default:
            assertNever(token);
    }
}
