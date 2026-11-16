import React from 'react';

import type {
    DocumentMarkBold,
    DocumentMarkCode,
    DocumentMarkColor,
    DocumentMarkItalic,
    DocumentMarkKeyboard,
    DocumentMarkStrikethrough,
    DocumentMarkSubscript,
    DocumentMarkSuperscript,
    DocumentText,
    DocumentTextMark,
} from '@gitbook/api';

import { cx } from '@/lib/classnames';
import { backgroundColorToStyle, textColorToStyle } from '@/lib/colors';

export function Text(props: { text: DocumentText }) {
    const { text } = props;

    return text.leaves.map((leaf, index) => {
        return (
            <React.Fragment key={index}>
                {leaf.marks
                    // Sort to have code marks at the end, so that they don't interfere with other marks
                    .sort((a, b) => (a.type === 'code' ? 1 : 0) - (b.type === 'code' ? 1 : 0))
                    .reduce<React.ReactNode>((children, mark, _index) => {
                        const Mark = MARK_STYLES[mark.type];

                        if (!Mark) {
                            return children;
                        }

                        return (
                            // @ts-ignore
                            <Mark key="mark" mark={mark}>
                                {children}
                            </Mark>
                        );
                    }, withSoftBreaks(leaf.text))}
            </React.Fragment>
        );
    });
}

// Paragraphs with buttons are flex containers, where a `\n` alone can't move the next items to a new line.
function withSoftBreaks(text: string): React.ReactNode {
    const lines = text.split('\n');
    // Keep `\n` in the same text node as a preceding `\r`: split apart, the HTML parser reads the lone `\r` as an extra line.
    return lines.flatMap((line, index) =>
        index < lines.length - 1 ? [`${line}\n`, <span key={index} className="basis-full" />] : line
    );
}

const MARK_STYLES = {
    bold: Bold,
    italic: Italic,
    code: Code,
    strikethrough: Strikethrough,
    color: Color,
    keyboard: Keyboard,
    superscript: Superscript,
    subscript: Subscript,
};

interface MarkedLeafProps<Mark extends DocumentTextMark> {
    mark: Mark;
    children: React.ReactNode;
}

function Bold(props: MarkedLeafProps<DocumentMarkBold>) {
    return <strong className="font-bold">{props.children}</strong>;
}

function Italic(props: MarkedLeafProps<DocumentMarkItalic>) {
    return <i className="font-italic">{props.children}</i>;
}

function Strikethrough(props: MarkedLeafProps<DocumentMarkStrikethrough>) {
    return <s className="line-through">{props.children}</s>;
}

function Keyboard(props: MarkedLeafProps<DocumentMarkKeyboard>) {
    return <kbd className="rounded-xs border border-b-2 px-1 font-mono">{props.children}</kbd>;
}

function Superscript(props: MarkedLeafProps<DocumentMarkSuperscript>) {
    return <sup>{props.children}</sup>;
}

function Subscript(props: MarkedLeafProps<DocumentMarkSubscript>) {
    return <sub>{props.children}</sub>;
}

function Code(props: MarkedLeafProps<DocumentMarkCode>) {
    return <code className="inline-code">{props.children}</code>;
}

function Color(props: MarkedLeafProps<DocumentMarkColor>) {
    const { mark, children } = props;
    return (
        <span
            data-highlight={
                mark.data.background && mark.data.background !== 'default' ? '' : undefined
            }
            className={cx(
                textColorToStyle[mark.data.text ?? 'default'],
                backgroundColorToStyle[mark.data.background ?? 'default']
            )}
        >
            {children}
        </span>
    );
}
