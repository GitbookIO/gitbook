import { DocumentBlockCode } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { highlight, HighlightLine, HighlightToken } from './highlight';
import { BlockProps } from '../Block';
import { Inline } from '../Inline';

export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, style, context } = props;
    const lines = await highlight(block);

    return (
        <pre className={tcls('p-4', 'rounded-md', 'bg-slate-100', '[counter-reset:line]', style)}>
            {lines.map((line, index) => (
                <CodeHighlightLine
                    block={block}
                    key={index}
                    line={line}
                    lineIndex={index + 1}
                    isLast={index === lines.length - 1}
                    context={context}
                />
            ))}
        </pre>
    );
}

function CodeHighlightLine(props: {
    block: DocumentBlockCode;
    line: HighlightLine;
    lineIndex: number;
    isLast: boolean;
    context: ContentRefContext;
}) {
    const { block, line, isLast, lineIndex, context } = props;

    const content = (
        <>
            <CodeHighlightTokens tokens={line.tokens} context={context} />
            {isLast ? null : '\n'}
        </>
    );

    if (block.data.lineNumbers === false) {
        return content;
    }

    return (
        <div className="flex flex-row before:text-slate-400 before:content-[counter(line)] [counter-increment:line] before:w-6">
            <span className="flex-1">{content}</span>
        </div>
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
