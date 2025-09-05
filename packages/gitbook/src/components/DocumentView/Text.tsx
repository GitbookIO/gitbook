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
import React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

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
                    }, leaf.text)}
            </React.Fragment>
        );
    });
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
    return (
        <code
            className={tcls(
                'py-px',
                'px-1.5',
                'min-w-6.5',
                'justify-center',
                'items-center',
                'leading-normal',
                'ring-1',
                'ring-inset',
                'ring-tint',
                'bg-tint',
                'rounded-sm',
                // Text size is proportional to the font-size of the parent element
                'text-[.875em]',
                // We ensure that the code is not making the parent bigger, especially in headings
                'leading-[calc(max(1.20em,1.25rem))]'
            )}
        >
            {props.children}
        </code>
    );
}

function Color(props: MarkedLeafProps<DocumentMarkColor>) {
    const { mark, children } = props;
    return (
        <span
            className={tcls([
                textColorToStyle[mark.data.text],
                backgroundColorToStyle[mark.data.background],
            ])}
        >
            {children}
        </span>
    );
}

/**
 * @TODO replace by DocumentMarkColor['data']['text'] and DocumentMarkColor['data']['background']
 * once the API is updated.
 */
type DocumentMarkColorValue =
    | 'default'
    | 'green'
    | 'blue'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'purple'
    | '$primary'
    | '$info'
    | '$success'
    | '$warning'
    | '$danger';

const textColorToStyle: { [color in DocumentMarkColorValue]: ClassValue } = {
    default: [],
    blue: ['text-blue-500'],
    red: ['text-red-500'],
    green: ['text-green-500'],
    yellow: ['text-yellow-600'],
    purple: ['text-purple-500'],
    orange: ['text-orange-500'],
    $primary: ['text-primary'],
    $info: ['text-info'],
    $success: ['text-success'],
    $warning: ['text-warning'],
    $danger: ['text-danger'],
};

const backgroundColorToStyle: { [color in DocumentMarkColorValue]: ClassValue } = {
    default: [],
    blue: ['bg-mark-blue'],
    red: ['bg-mark-red'],
    green: ['bg-mark-green'],
    yellow: ['bg-mark-yellow'],
    purple: ['bg-mark-purple'],
    orange: ['bg-mark-orange'],
    $primary: ['bg-primary'],
    $info: ['bg-info'],
    $success: ['bg-success'],
    $warning: ['bg-warning'],
    $danger: ['bg-danger'],
};
