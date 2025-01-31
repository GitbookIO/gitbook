import type { DocumentBlockCode } from '@gitbook/api';
import assertNever from 'assert-never';
import { useId } from 'react';

import { tcls } from '@/lib/tailwind';

import { CopyCodeButton } from './CopyCodeButton';
import type { HighlightLine, HighlightToken } from './highlight';
import { AnnotationPopover } from '../Annotation/AnnotationPopover';
import type { BlockProps } from '../Block';

import './theme.css';
import './CodeBlockRenderer.css';

type CodeBlockRendererProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    lines: HighlightLine[];
};

/**
 * The logic of rendering a code block from lines.
 */
export function ClientCodeBlockRenderer(props: CodeBlockRendererProps) {
    const { block, style, lines } = props;

    const id = useId();
    const withLineNumbers = Boolean(block.data.lineNumbers) && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;

    return (
        <div className={tcls('group/codeblock grid grid-flow-col', style)}>
            <div className="flex items-center justify-start [grid-area:1/1] text-sm gap-2">
                {title ? (
                    <div className="text-xs tracking-wide text-dark/7 leading-none inline-flex items-center justify-center bg-light-2 rounded-t straight-corners:rounded-t-s px-3 py-2 dark:bg-dark-2 dark:text-light/7">
                        {title}
                    </div>
                ) : null}
            </div>
            <CopyCodeButton
                codeId={id}
                style="group-hover/codeblock:opacity-[1] transition-opacity duration-75 opacity-0 text-xs [grid-area:2/1] z-[2] justify-self-end backdrop-blur-md leading-none self-start ring-1 ring-dark/2 text-dark/7 bg-transparent rounded-md mr-2 mt-2 p-1 hover:ring-dark/3 dark:ring-light/2 dark:text-light/7 dark:hover:ring-light/3"
            />
            <pre
                className={tcls(
                    '[grid-area:2/1] relative overflow-auto bg-light-2 dark:bg-dark-2 dark:border-dark-4 hide-scroll',
                    'rounded-md straight-corners:rounded-sm',
                    title && 'rounded-ss-none',
                )}
            >
                <code
                    id={id}
                    className={tcls(
                        'min-w-full inline-grid grid-cols-[auto_1fr] p-2 [count-reset:line]',
                        withWrap && 'whitespace-pre-wrap',
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
}

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
