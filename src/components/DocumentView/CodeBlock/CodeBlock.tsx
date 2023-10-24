import { tcls } from '@/lib/tailwind';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { highlight, HighlightLine, HighlightToken } from './highlight';
import { Inline } from '../Inline';

export async function CodeBlock(props: BlockProps<any>) {
    const { block, style } = props;
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
                />
            ))}
        </pre>
    );
}

function CodeHighlightLine(props: {
    block: any;
    line: HighlightLine;
    lineIndex: number;
    isLast: boolean;
}) {
    const { block, line, isLast, lineIndex } = props;

    const content = (
        <>
            <CodeHighlightTokens tokens={line.tokens} />
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

    if (token.type === 'inline') {
        return (
            <Inline inline={token.inline}>
                <CodeHighlightTokens tokens={token.children} />
            </Inline>
        );
    }

    if (!token.token.color) {
        return <>{token.token.content}</>;
    }

    return <span style={{ color: token.token.color }}>{token.token.content}</span>;
}
