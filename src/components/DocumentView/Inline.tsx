import {
    DocumentInlineImage,
    DocumentInlineAnnotation,
    DocumentInlineEmoji,
    DocumentInlineLink,
    DocumentInlineMath,
    DocumentInlineMention,
    DocumentInline,
} from '@gitbook/api';

import { Annotation } from './Annotation/Annotation';
import { DocumentContextProps } from './DocumentView';
import { Link } from './Link';
import { InlineMath } from './Math';

export interface InlineProps<T extends DocumentInline> extends DocumentContextProps {
    inline: T;

    /**
     * If defined, replace the content of the inline.
     */
    children?: React.ReactNode;
}

export function Inline<
    T extends
        | DocumentInlineImage
        | DocumentInlineAnnotation
        | DocumentInlineEmoji
        | DocumentInlineLink
        | DocumentInlineMath
        | DocumentInlineMention,
>(props: InlineProps<T>) {
    const { inline, ...contextProps } = props;

    switch (inline.type) {
        case 'link':
            return <Link {...contextProps} inline={inline} />;
        case 'inline-math':
            return <InlineMath {...contextProps} inline={inline} />;
        case 'annotation':
            return <Annotation {...contextProps} inline={inline} />;
        default:
            return <span>Unsupported inline {inline.type}</span>;
    }
}
