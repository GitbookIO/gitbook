import {
    DocumentInlineImage,
    DocumentInlineAnnotation,
    DocumentInlineEmoji,
    DocumentInlineLink,
    DocumentInlineMath,
    DocumentInlineMention,
    DocumentInline,
    JSONDocument,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { Annotation } from './Annotation/Annotation';
import { DocumentContextProps } from './DocumentView';
import { Emoji } from './Emoji';
import { InlineImage } from './InlineImage';
import { Link } from './Link';
import { InlineMath } from './Math';
import { Mention } from './Mention';

export interface InlineProps<T extends DocumentInline> extends DocumentContextProps {
    inline: T;

    /**
     * Document being rendered.
     */
    document: JSONDocument;

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
        case 'emoji':
            return <Emoji {...contextProps} inline={inline} />;
        case 'mention':
            return <Mention {...contextProps} inline={inline} />;
        case 'inline-image':
            return <InlineImage {...contextProps} inline={inline} />;
        default:
            assertNever(inline);
    }
}
