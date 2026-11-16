import assertNever from 'assert-never';
import { forwardRef, useId } from 'react';

import type { DocumentBlockCode } from '@gitbook/api';

import { AnnotationPopover } from '../Annotation/AnnotationPopover';
import type { BlockProps } from '../Block';
import { getCommentKeyAttributes } from '../utils/commentAnchors';
import { AskAICodeButton } from './AskAICodeButton';
import { CopyCodeButton } from './CopyCodeButton';
import type { HighlightLine, HighlightTheme, HighlightToken } from './highlight-tokens';
import { cx } from '@/lib/classnames';
import { tcls } from '@/lib/tailwind';

type CodeBlockRendererProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    theme: HighlightTheme;
    /** Node key for comments, set only where commenting is possible. */
    commentKey?: string;
    'aria-busy'?: boolean;
    id?: string;
    /**
     * Whether the block is rendered for print/PDF.
     * When true, the "Ask AI" button is not rendered.
     */
    isPrint?: boolean;
    embedded?: boolean;
};

/**
 * The logic of rendering a code block from lines.
 */
export const CodeBlockRenderer = forwardRef(function CodeBlockRenderer(
    props: CodeBlockRendererProps,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const { block, style, theme, 'aria-busy': ariaBusy, isPrint, embedded, commentKey } = props;

    const withLineNumbers = Boolean(block.data.lineNumbers) && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title;
    const withTitle = Boolean(title && !embedded);
    const isSingleLine = theme.lines.length <= 1 && !withWrap;

    const id = useId();
    const codeId = props.id || id;

    /* Shiki returns a color + CSS variables in a single string, which isn't supported in React.
    So we parse the foreground & background into objects that can be passed into React's `style` prop. */
    const bg = parseShikiColorString(theme.bg);
    const fg = parseShikiColorString(theme.fg);
    const codeBackground = embedded ? undefined : bg;

    return (
        <div
            ref={ref}
            id={codeId}
            {...getCommentKeyAttributes(commentKey)}
            aria-busy={ariaBusy}
            className={cx('shiki codeblock', !embedded && 'codeblock-framed', tcls(style))}
            /* Sets the code theme's mode (light or dark) for the site's theme mode (light or dark).
             * Used to style UI elements (scrollbars, form controls) correctly and apply the right default to "plain" code blocks. */
            data-color-scheme={`${theme.themes.light.type} ${theme.themes.dark.type}`}
        >
            <span data-codeblock-focus tabIndex={-1} aria-hidden className="codeblock-focus" />
            <div className="codeblock-header">
                {withTitle ? (
                    <div
                        className="codeblock-title"
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
            <div className="codeblock-body">
                {!embedded ? (
                    <div
                        className={cx(
                            'codeblock-actions',
                            isSingleLine && 'codeblock-actions-centered'
                        )}
                    >
                        {!isPrint ? (
                            <AskAICodeButton
                                codeId={codeId}
                                title={title}
                                syntax={block.data.syntax}
                                style="codeblock-button"
                            />
                        ) : null}
                        <CopyCodeButton codeId={codeId} style="codeblock-button" />
                    </div>
                ) : null}
                <pre
                    className={cx(
                        'codeblock-pre',
                        embedded ? 'codeblock-pre-embedded' : 'codeblock-pre-framed',
                        withTitle && 'codeblock-pre-titled'
                    )}
                    style={{
                        backgroundColor: codeBackground?.color,
                        ...codeBackground?.vars,
                        color: fg?.color,
                        ...fg?.vars,
                    }}
                >
                    <code className={cx('codeblock-code', withWrap && 'codeblock-code-wrap')}>
                        {theme.lines.map((line, index) => (
                            <CodeHighlightLine
                                bg={codeBackground}
                                embedded={embedded}
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
        </div>
    );
});

function CodeHighlightLine(props: {
    line: HighlightLine;
    bg?: ShikiColorDefinition;
    embedded?: boolean;
    fg?: ShikiColorDefinition;
    isLast: boolean;
    withLineNumbers: boolean;
}) {
    const { line, isLast, withLineNumbers, bg, embedded, fg } = props;
    const embeddedPlainLine = Boolean(embedded && !line.diff && !line.highlighted);
    const lineStyle = {
        color: fg?.color,
        ...fg?.vars,
        backgroundColor: bg?.color,
        ...bg?.vars,
    };
    return (
        <span
            className={cx(
                'highlight-line',
                embeddedPlainLine && 'highlight-line-plain',
                line.diff === 'added' && 'diff-added',
                line.diff === 'deleted' && 'diff-deleted',
                line.highlighted && 'highlighted'
            )}
            aria-label={
                line.diff === 'added'
                    ? 'Added line'
                    : line.diff === 'deleted'
                      ? 'Removed line'
                      : undefined
            }
            style={lineStyle}
        >
            {withLineNumbers && <span className="highlight-line-number" style={lineStyle} />}
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
