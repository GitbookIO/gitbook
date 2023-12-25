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
    const titleRounding = title ? ['rounded-md', 'rounded-ss-none'] : ['rounded-md'];

    return (
        <div className={tcls('grid', 'grid-flow-col', style, fullWidthStyle)}>
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
                            '[background-color:color-mix(in_srgb,_rgb(var(--light)),_rgb(var(--dark))_3%)]',
                            'rounded-t',
                            'px-3',
                            'py-2',
                            'dark:bg-light/1',
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
                    'text-xs',
                    '[grid-area:2/1]',
                    'z-[1]',
                    'justify-self-end',
                    'backdrop-blur-md',
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
                    'linear-mask-util',
                    '[background-color:color-mix(in_srgb,_rgb(var(--light)),_rgb(var(--dark))_3%)]',
                    'dark:bg-light/1',

                    titleRounding,
                )}
            >
                <code
                    id={id}
                    className={tcls(
                        'min-w-full',
                        'table',
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
                'overflow-hidden',
                'table-row',
                'relative',
                'linear-mask-util',
                'ring-2',
                'ring-transparent',
                'hover:ring-dark/2',
                'dark:hover:ring-light/2',
                'rounded',
                'mask-[linear-gradient(to right, transparent, #000 1rem, #000 100%)]',
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

                line.highlighted ? ['highlighted', 'bg-dark/1', 'dark:bg-sky/1'] : null,
            )}
        >
            {withLineNumbers ? (
                <span
                    className={tcls(
                        'table-cell',
                        'text-sm',
                        'w-[0.01ch]',
                        'text-right',
                        'pr-3',
                        'pl-2',
                        'sticky',
                        'left-0',
                        '[background:linear-gradient(to_right,_color-mix(in_srgb,_rgb(var(--light)),_rgb(var(--dark))_3%)_60%,_transparent)]',
                        'dark:[background:linear-gradient(to_right,_color-mix(in_srgb,_rgb(var(--dark)),_rgb(var(--light))_4%)_60%,_transparent)]',
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
                                            '[background:linear-gradient(to_right,_color-mix(in_srgb,_rgb(var(--light)),_rgb(var(--dark))_7%)_60%,_transparent)]',
                                            'dark:[background:linear-gradient(to_right,_color-mix(in_srgb,_rgb(var(--dark)),_rgb(var(--sky))_9%)_60%,_transparent)]',
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

    return <span style={{ color: colorToCSSVar[token.token.color] }}>{token.token.content}</span>;
}
