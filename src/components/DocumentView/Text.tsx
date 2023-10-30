import { tcls } from '@/lib/tailwind';
import { DocumentNodeText, DocumentTextMark } from '@gitbook/api';
import React from 'react';

export function Text(props: { text: DocumentNodeText }) {
    const { text } = props;

    return (
        <>
            {text.leaves.map((leaf, index) => {
                return (
                    <React.Fragment key={index}>
                        {leaf.marks.reduce<React.ReactNode>((children, mark, index) => {
                            const Mark = MARK_STYLES[mark.type];

                            if (!Mark) {
                                return children;
                            }

                            return <Mark mark={mark}>{children}</Mark>;
                        }, leaf.text)}
                    </React.Fragment>
                );
            })}
        </>
    );
}

const MARK_STYLES = {
    bold: Bold,
    italic: Italic,
    code: Code,
    strikethrough: Strikethrough,
    color: Color,
};

interface MarkedLeafProps {
    mark: DocumentTextMark;
    children: React.ReactNode;
}

function Bold(props: MarkedLeafProps) {
    return <strong className={tcls('font-semibold')}>{props.children}</strong>;
}

function Italic(props: MarkedLeafProps) {
    return <i className={tcls('font-italic')}>{props.children}</i>;
}

function Strikethrough(props: MarkedLeafProps) {
    return <s className={tcls('line-through')}>{props.children}</s>;
}

function Code(props: MarkedLeafProps) {
    return (
        <code className={tcls('text-slate-800', 'bg-slate-100', 'rounded', 'py-0.5', 'px-1')}>
            {props.children}
        </code>
    );
}

function Color(props: MarkedLeafProps) {
    return <span>{props.children}</span>;
}
