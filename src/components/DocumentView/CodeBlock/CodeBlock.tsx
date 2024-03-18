import { DocumentBlockCode, JSONDocument } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { CopyCodeButton } from './CopyCodeButton';
import { colorToCSSVar, highlight, HighlightLine, HighlightToken } from './highlight';
import { BlockProps } from '../Block';
import { DocumentContext } from '../DocumentView';
import { Inline } from '../Inline';

import './theme.css';

/**
 * Render an entire code-block. The syntax highlighting is done server-side.
 */
export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, context } = props;
    const lines = await highlight(block);

    const id = block.key!;

    const withLineNumbers = !!block.data.lineNumbers && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;
    const fullWidth = block.data.fullWidth;

    const fullWidthStyle = fullWidth ? 'max-w-4xl' : 'max-w-3xl';
    const titleRoundingStyle = [
        'rounded-md',
        'straight-corners:rounded-sm',
        title ? 'rounded-ss-none' : null,
    ];

    return (
        <div className={tcls('group/codeblock', 'grid', 'grid-flow-col', fullWidthStyle, style)}>
            <div
                className={tcls(
                    'flex',
                    'items-center',
                    'justify-start',
                    '[grid-area:1/1]',
                    'text-sm',
                    'gap-2',
                )}
            >
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
                            document={document}
                            key={index}
                            line={line}
                            lineIndex={index + 1}
                            isLast={index === lines.length - 1}
                            withLineNumbers={withLineNumbers}
                            withWrap={withWrap}
                            context={context}
                        />
                    ))}
                </code>
            </pre>
        </div>
    );
}

function CodeHighlightLine(props: {
    block: DocumentBlockCode;
    document: JSONDocument;
    line: HighlightLine;
    lineIndex: number;
    isLast: boolean;
    withLineNumbers: boolean;
    withWrap: boolean;
    context: DocumentContext;
}) {
    const { block, document, line, isLast, withLineNumbers, context } = props;
    return (
        <span
            className={tcls(
                'grid',
                '[grid-template-columns:subgrid]',
                'col-span-2',
                'relative',
                'ring-1',
                'ring-transparent',
                'hover:ring-dark-4/5',
                'hover:z-[1]',
                'dark:hover:ring-light-4/4',
                'rounded',
                //first child
                '[&.highlighted:first-child]:rounded-t-md',
                '[&.highlighted:first-child>*]:mt-1',
                //last child
                '[&.highlighted:last-child]:rounded-b-md',
                '[&.highlighted:last-child>*]:mb-1',
                //is only child, dont hover effect line
                '[&:only-child]:hover:ring-transparent',
                //select all highlighted
                '[&.highlighted]:rounded-none',
                //select first in group
                '[&:not(.highlighted)_+_.highlighted]:rounded-t-md',
                '[&:not(.highlighted)_+_.highlighted>*]:mt-1',
                //select last in group
                '[&.highlighted:has(+:not(.highlighted))]:rounded-b-md',
                '[&.highlighted:has(+:not(.highlighted))>*]:mb-1',
                //select if highlight is singular in group
                '[&:not(.highlighted)_+_.highlighted:has(+:not(.highlighted))]:rounded-md',

                line.highlighted ? ['highlighted', 'bg-light-3', 'dark:bg-dark-3'] : null,
            )}
        >
            {withLineNumbers ? (
                <span
                    className={tcls(
                        'text-sm',
                        'text-right',
                        'pr-3.5',
                        'rounded-l',
                        'pl-2',
                        'sticky',
                        'left-[-3px]',
                        'bg-gradient-to-r',
                        'from-80%',
                        'from-light-2',
                        'to-transparent',
                        'dark:from-dark-2',
                        'dark:to-transparent',
                        withLineNumbers
                            ? [
                                  'before:text-dark/5',
                                  'before:content-[counter(line)]',
                                  '[counter-increment:line]',
                                  'dark:before:text-light/4',

                                  line.highlighted
                                      ? [
                                            'before:text-dark/6',
                                            'dark:before:text-light/8',
                                            'bg-gradient-to-r',
                                            'from-80%',
                                            'from-light-3',
                                            'to-transparent',
                                            'dark:from-dark-3',
                                            'dark:to-transparent',
                                        ]
                                      : null,
                              ]
                            : [],
                    )}
                ></span>
            ) : null}

            <span className={tcls('ml-3', 'block', 'text-sm')}>
                <CodeHighlightTokens tokens={line.tokens} document={document} context={context} />
                {isLast ? null : !withLineNumbers && line.tokens.length === 0 && 0 ? (
                    <span className="ew">{'\u200B'}</span>
                ) : (
                    '\n'
                )}
            </span>
        </span>
    );
}

function CodeHighlightTokens(props: {
    tokens: HighlightToken[];
    document: JSONDocument;
    context: DocumentContext;
}) {
    const { tokens, document, context } = props;

    return (
        <>
            {tokens.map((token, index) => (
                <CodeHighlightToken
                    key={index}
                    token={token}
                    document={document}
                    context={context}
                />
            ))}
        </>
    );
}

function CodeHighlightToken(props: {
    token: HighlightToken;
    document: JSONDocument;
    context: DocumentContext;
}) {
    const { token, document, context } = props;

    if (token.type === 'inline') {
        return (
            <Inline inline={token.inline} document={document} context={context}>
                <CodeHighlightTokens
                    tokens={token.children}
                    document={document}
                    context={context}
                />
            </Inline>
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
