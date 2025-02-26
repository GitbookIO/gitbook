import type {
    DocumentMarkBold,
    DocumentMarkCode,
    DocumentMarkColor,
    DocumentMarkItalic,
    DocumentMarkKeyboard,
    DocumentMarkStrikethrough,
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
};

interface MarkedLeafProps<Mark extends DocumentTextMark> {
    mark: Mark;
    children: React.ReactNode;
}

function Bold(props: MarkedLeafProps<DocumentMarkBold>) {
    return <strong className={tcls('font-bold')}>{props.children}</strong>;
}

function Italic(props: MarkedLeafProps<DocumentMarkItalic>) {
    return <i className={tcls('font-italic')}>{props.children}</i>;
}

function Strikethrough(props: MarkedLeafProps<DocumentMarkStrikethrough>) {
    return <s className={tcls('line-through')}>{props.children}</s>;
}

function Keyboard(props: MarkedLeafProps<DocumentMarkKeyboard>) {
    return (
        <kbd className="rounded border px-1 font-mono shadow-[0_1px_0_0_theme(borderColor.DEFAULT)]">
            {props.children}
        </kbd>
    );
}

function Code(props: MarkedLeafProps<DocumentMarkCode>) {
    return (
        <code
            className={tcls(
                'py-[1px]',
                'px-1.5',
                'min-w-[1.625rem]',
                'justify-center',
                'items-center',
                'leading-normal',
                'ring-1',
                'ring-inset',
                'ring-tint',
                'bg-tint',
                'rounded',
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

const textColorToStyle: { [color in DocumentMarkColor['data']['text']]: ClassValue } = {
    default: [],
    blue: ['text-blue-500'],
    red: ['text-red-500'],
    green: ['text-green-500'],
    yellow: ['text-yellow-600'],
    purple: ['text-purple-500'],
    orange: ['text-orange-500'],
};

const backgroundColorToStyle: { [color in DocumentMarkColor['data']['background']]: ClassValue } = {
    default: [],
    blue: ['bg-mark-blue'],
    red: ['bg-mark-red'],
    green: ['bg-mark-green'],
    yellow: ['bg-mark-yellow'],
    purple: ['bg-mark-purple'],
    orange: ['bg-mark-orange'],
};
