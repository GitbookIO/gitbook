import { DocumentBlockCode, JSONDocument } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { CopyCodeButton } from './CopyCodeButton';
import type { HighlightLine, HighlightToken } from './highlight';
import { AnnotationPopover } from '../Annotation/AnnotationPopover';
import { BlockProps } from '../Block';
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

    const id = block.key!;

    const withLineNumbers = !!block.data.lineNumbers && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;
    const titleRoundingStyle = [
        'rounded-md',
        'straight-corners:rounded-sm',
        title ? 'rounded-ss-none' : null,
    ];

    return (
        <div className={tcls('group/codeblock grid grid-flow-col', style)}>
            <div className="flex items-center justify-start [grid-area:1/1] text-sm gap-2">
                {title ? (
                    <div
                        className={tcls(
                            'text-xs',
                            'tracking-wide',
                            'text-dark/7',
                            'leading-none',
                            'inline-flex',
                            'items-center',
                            'justify-center',
                            'bg-light-2',
                            'rounded-t',
                            'straight-corners:rounded-t-s',
                            'px-3',
                            'py-2',
                            'dark:bg-dark-2',
                            'dark:text-light/7',
                        )}
                    >
                        {title}
                    </div>
                ) : null}
            </div>
            <CopyCodeButton
                codeId={id}
                style={[
                    'group-hover/codeblock:opacity-[1]',
                    'transition-opacity',
                    'duration-75',
                    'opacity-0',
                    'text-xs',
                    '[grid-area:2/1]',
                    'z-[2]',
                    'justify-self-end',
                    'backdrop-blur-md',
                    'leading-none',
                    'self-start',
                    'ring-1',
                    'ring-dark/2',
                    'text-dark/7',
                    'bg-transparent',
                    'rounded-md',
                    'mr-2',
                    'mt-2',
                    'p-1',
                    'hover:ring-dark/3',
                    'dark:ring-light/2',
                    'dark:text-light/7',
                    'dark:hover:ring-light/3',
                ]}
            />
            <pre
                className={tcls(
                    '[grid-area:2/1]',
                    'relative',
                    'overflow-auto',
                    'bg-light-2',
                    'dark:bg-dark-2',
                    'border-light-4',
                    'dark:border-dark-4',
                    'hide-scroll',
                    titleRoundingStyle,
                )}
            >
                <code
                    id={id}
                    className={tcls(
                        'min-w-full',
                        'inline-grid',
                        '[grid-template-columns:auto_1fr]',
                        'py-2',
                        'px-2',
                        '[counter-reset:line]',
                        withWrap ? 'whitespace-pre-wrap' : '',
                    )}
                >
                    {lines.map((line, index) => (
                        <CodeHighlightLine
                            block={block}
                            key={index}
                            line={line}
                            lineIndex={index + 1}
                            isLast={index === lines.length - 1}
                            withLineNumbers={withLineNumbers}
                            withWrap={withWrap}
                        />
                    ))}
                </code>
            </pre>
        </div>
    );
}

function CodeHighlightLine(props: {
    block: DocumentBlockCode;
    line: HighlightLine;
    lineIndex: number;
    isLast: boolean;
    withLineNumbers: boolean;
    withWrap: boolean;
}) {
    const { line, isLast, withLineNumbers } = props;
    return (
        <span className={tcls('highlight-line', line.highlighted && 'highlighted')}>
            {withLineNumbers ? (
                <span
                    className={tcls('highlight-line-number', line.highlighted && 'highlighted')}
                ></span>
            ) : null}

            <span className="highlight-line-content">
                <CodeHighlightTokens tokens={line.tokens} />
                {isLast ? null : !withLineNumbers && line.tokens.length === 0 && 0 ? (
                    <span className="ew">{'\u200B'}</span>
                ) : (
                    '\n'
                )}
            </span>
        </span>
    );
}

function CodeHighlightTokens(props: { tokens: HighlightToken[] }) {
    const { tokens } = props;

    return (
        <>
            {tokens.map((token, index) => (
                <CodeHighlightToken key={index} token={token} />
            ))}
        </>
    );
}

function CodeHighlightToken(props: { token: HighlightToken }) {
    const { token } = props;

    if (token.type === 'annotation') {
        return (
            <AnnotationPopover body={token.body}>
                <CodeHighlightTokens tokens={token.children} />
            </AnnotationPopover>
        );
    }

    if (token.type === 'plain') {
        return <>{token.content}</>;
    }

    if (!token.token.color) {
        return <>{token.token.content}</>;
    }

    return <span style={{ color: token.token.color }}>{token.token.content}</span>;
}
