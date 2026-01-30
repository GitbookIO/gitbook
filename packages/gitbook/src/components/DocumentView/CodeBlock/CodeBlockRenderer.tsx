import type { DocumentBlockCode } from '@gitbook/api';
import assertNever from 'assert-never';
import { forwardRef, useId } from 'react';

import { tcls } from '@/lib/tailwind';

import { AnnotationPopover } from '../Annotation/AnnotationPopover';
import type { BlockProps } from '../Block';
import { CopyCodeButton } from './CopyCodeButton';
import type { HighlightLine, HighlightTheme, HighlightToken } from './highlight';

type CodeBlockRendererProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    theme: HighlightTheme;
    'aria-busy'?: boolean;
    id?: string;
};

/**
 * The logic of rendering a code block from lines.
 */
export const CodeBlockRenderer = forwardRef(function CodeBlockRenderer(
    props: CodeBlockRendererProps,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const { block, style, theme, 'aria-busy': ariaBusy } = props;

    const withLineNumbers = Boolean(block.data.lineNumbers) && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;

    const id = useId();
    const codeId = props.id || id;

    /* Shiki returns a color + CSS variables in a single string, which isn't supported in React.
    So we parse the foreground & background into objects that can be passed into React's `style` prop. */
    const bg = parseShikiColorString(theme.bg);
    const fg = parseShikiColorString(theme.fg);

    return (
        <div
            ref={ref}
            aria-busy={ariaBusy}
            className={tcls(
                'group/codeblock shiki grid shrink grid-flow-col overflow-hidden',
                style
            )}
            /* Sets the code theme's mode (light or dark) for the site's theme mode (light or dark).
             * Used to style UI elements (scrollbars, form controls) correctly and apply the right default to "plain" code blocks. */
            data-color-scheme={`${theme.themes.light.type} ${theme.themes.dark.type}`}
        >
            <div className="flex items-center justify-start gap-2 text-sm [grid-area:1/1]">
                {title ? (
                    <div
                        className="relative top-px z-20 inline-flex items-center justify-center circular-corners:rounded-t-xl rounded-corners:rounded-t-lg straight-corners:rounded-t-xs border border-tint-subtle border-b-0 bg-tint-subtle theme-bold-tint:bg-tint-base theme-muted:bg-tint-base px-3 py-2 text-tint text-xs leading-none tracking-wide contrast-more:border-tint contrast-more:bg-tint-base [html.theme-bold.sidebar-filled_&]:bg-tint-base"
                        style={{
                            backgroundColor: bg?.color,
                            ...bg?.vars,
                            color: fg?.color,
                            ...fg?.vars,
                        }}
                    >
                        {title}
                    </div>
                ) : null}
            </div>
            <CopyCodeButton
                codeId={codeId}
                style="z-2 mt-2 mr-2 self-start justify-self-end leading-none opacity-0 backdrop-blur-md [grid-area:2/1] group-hover/codeblock:opacity-11"
            />
            <pre
                className={tcls(
                    'relative overflow-auto border border-tint-subtle bg-tint-subtle theme-muted:bg-tint-base p-2 text-tint-strong [grid-area:2/1] contrast-more:border-tint contrast-more:bg-tint-base [html.theme-bold.sidebar-filled_&]:bg-tint-base',
                    'circular-corners:rounded-2xl rounded-corners:rounded-xl straight-corners:rounded-xs depth-subtle:shadow-xs',
                    title && 'rounded-ss-none!'
                )}
                style={{
                    backgroundColor: bg?.color,
                    ...bg?.vars,
                    color: fg?.color,
                    ...fg?.vars,
                }}
            >
                <code
                    id={codeId}
                    className={tcls(
                        'inline-grid max-h-full min-w-full grid-cols-[auto_1fr] [count-reset:line] print:whitespace-pre-wrap',
                        withWrap && 'whitespace-pre-wrap',
                        '[[aria-expanded=false]_&]:mask-b-from-50%'
                    )}
                >
                    {theme.lines.map((line, index) => (
                        <CodeHighlightLine
                            bg={bg}
                            fg={fg}
                            key={index}
                            line={line}
                            isLast={index === theme.lines.length - 1}
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
    bg?: ShikiColorDefinition;
    fg?: ShikiColorDefinition;
    isLast: boolean;
    withLineNumbers: boolean;
}) {
    const { line, isLast, withLineNumbers, bg, fg } = props;
    return (
        <span
            className={tcls('highlight-line', line.highlighted && 'highlighted')}
            style={
                line.highlighted
                    ? {
                          backgroundColor: bg?.color,
                          ...bg?.vars,
                      }
                    : undefined
            }
        >
            {withLineNumbers && (
                <span
                    className="highlight-line-number"
                    style={{
                        color: fg?.color,
                        ...fg?.vars,
                        backgroundColor: bg?.color,
                        ...bg?.vars,
                    }}
                />
            )}
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
            if (!token.token.htmlStyle) {
                return token.token.content;
            }

            return <span style={token.token.htmlStyle}>{token.token.content}</span>;
        }
        default:
            assertNever(token);
    }
}

type ShikiColorDefinition = {
    color: string | undefined;
    vars: Record<string, string> | undefined;
};

/**
 * Parse Shiki color string format into separate color and CSS variables.
 *
 * Shiki returns colors in a format that combines a default color with CSS variables:
 * "defaultColor;--shiki-light:value1;--shiki-dark:value2"
 *
 * React does not parse these strings as valid CSS because they contain values & properties in one.
 * We split these so React can apply them separately via the style prop.
 */
function parseShikiColorString(
    originalColor: string | undefined
): ShikiColorDefinition | undefined {
    if (!originalColor) {
        return undefined;
    }

    const parts = originalColor.split(';');
    const color = parts[0];
    const vars = parts.slice(1).reduce(
        (acc, item) => {
            const [key, value] = item.split(':');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        },
        {} as Record<string, string>
    );

    return {
        color,
        vars: Object.keys(vars).length > 0 ? vars : undefined,
    };
}
