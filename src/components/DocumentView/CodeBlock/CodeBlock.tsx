import { DocumentBlockCode } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { ClassValue, tcls } from '@/lib/tailwind';

import { CopyCodeButton } from './CopyCodeButton';
import { highlight, HighlightLine, HighlightToken } from './highlight';
import { BlockProps } from '../Block';
import { Inline } from '../Inline';

import './theme.css';

/**
 * Render an entire code-block. The syntax highlighting is done server-side.
 */
export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, style, context } = props;
    const lines = await highlight(block);

    const id = block.key!;

    const withLineNumbers = !!block.data.lineNumbers && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';

    return (
        <pre className={tcls('relative', style)}>
            <code
                id={id}
                className={tcls(
                    'flex',
                    'flex-col',
                    'flex-wrap',
                    'py-4',
                    'rounded-md',
                    'bg-light',
                    '[counter-reset:line]',
                    withWrap ? 'whitespace-pre-wrap' : 'overflow-x-scroll',
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
                        context={context}
                    />
                ))}
            </code>
            <CopyCodeButton codeId={id} style={['absolute', 'top-2', 'right-2']} />
        </pre>
    );
}

function CodeHighlightLine(props: {
    block: DocumentBlockCode;
    line: HighlightLine;
    lineIndex: number;
    isLast: boolean;
    withLineNumbers: boolean;
    withWrap: boolean;
    context: ContentRefContext;
}) {
    const { block, line, isLast, withLineNumbers, context } = props;

    return (
        <span
            className={tcls(
                'flex',
                'flex-row',
                'px-4',
                line.highlighted ? 'bg-dark/5' : null,
                withLineNumbers
                    ? [
                          'before:shrink-0',
                          'before:absolute',
                          'before:left-0',
                          'before:pl-4',
                          line.highlighted ? 'before:bg-primary-200' : 'before:bg-primary-100',
                          'before:text-primary-400',
                          'before:content-[counter(line)]',
                          '[counter-increment:line]',
                          getLineNumberGutterWidth(block),
                      ]
                    : [],
            )}
        >
            <span className="flex-1">
                <CodeHighlightTokens tokens={line.tokens} context={context} />
                {isLast ? null : !withLineNumbers && line.tokens.length === 0 && 0 ? (
                    <span className="ew">{'\u200B'}</span>
                ) : (
                    '\n'
                )}
            </span>
        </span>
    );
}

function CodeHighlightTokens(props: { tokens: HighlightToken[]; context: ContentRefContext }) {
    const { tokens, context } = props;

    return (
        <>
            {tokens.map((token, index) => (
                <CodeHighlightToken key={index} token={token} context={context} />
            ))}
        </>
    );
}

function CodeHighlightToken(props: { token: HighlightToken; context: ContentRefContext }) {
    const { token, context } = props;

    if (token.type === 'inline') {
        return (
            <Inline inline={token.inline} context={context}>
                <CodeHighlightTokens tokens={token.children} context={context} />
            </Inline>
        );
    }

    if (!token.token.color) {
        return <>{token.token.content}</>;
    }

    return <span style={{ color: token.token.color }}>{token.token.content}</span>;
}

/**
 * Compute the width ofthe gutter with the line number to align the code.
 */
function getLineNumberGutterWidth(block: DocumentBlockCode): ClassValue {
    if (block.nodes.length < 10) {
        return ['before:w-8', 'ml-8'];
    } else if (block.nodes.length < 100) {
        return ['before:w-10', 'ml-10'];
    } else if (block.nodes.length < 1000) {
        return ['before:w-12', 'ml-12'];
    } else {
        return ['before:w-14', 'ml-14'];
    }
}
