import {
    DocumentInlineImage,
    DocumentInlineAnnotation,
    DocumentInlineEmoji,
    DocumentInlineLink,
    DocumentInlineMath,
    DocumentInlineMention,
} from '@gitbook/api';
import { DocumentContextProps } from './DocumentView';
import { Link } from './Link';

export interface InlineProps<T> extends DocumentContextProps {
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
        default:
            return <span>Unsupported inline {inline.type}</span>;
    }
}
