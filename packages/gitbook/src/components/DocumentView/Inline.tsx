import type {
    DocumentInline,
    DocumentInlineAnnotation,
    DocumentInlineButton,
    DocumentInlineEmoji,
    DocumentInlineImage,
    DocumentInlineLink,
    DocumentInlineMath,
    DocumentInlineMention,
} from '@gitbook/api';
import assertNever from 'assert-never';

import type { SlimJSONDocument } from '@/lib/slim-document';
import { Annotation } from './Annotation/Annotation';
import type { DocumentContextProps } from './DocumentView';
import { Emoji } from './Emoji';
import { InlineButton } from './InlineButton';
import { InlineImage } from './InlineImage';
import { InlineLink } from './InlineLink';
import { InlineMath } from './Math';
import { Mention } from './Mention';

export interface InlineProps<T extends DocumentInline> extends DocumentContextProps {
    inline: T;

    /**
     * Document being rendered.
     */
    document: SlimJSONDocument;

    /**
     * Inline ancestors of the current inline.
     */
    ancestorInlines: DocumentInline[];

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
        | DocumentInlineMention
        | DocumentInlineButton,
>(props: InlineProps<T>) {
    const { inline, ...contextProps } = props;

    switch (inline.type) {
        case 'link':
            return <InlineLink {...contextProps} inline={inline} />;
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
        case 'button':
            return <InlineButton {...contextProps} inline={inline} />;
        default:
            assertNever(inline);
    }
}
