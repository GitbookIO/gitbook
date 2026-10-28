import type { DocumentInlineEmoji } from '@gitbook/api';

import type { InlineProps } from './Inline';
import { Emoji as EmojiPrimitive } from '@/components/primitives';

export function Emoji(props: InlineProps<DocumentInlineEmoji>) {
    const { inline } = props;

    return <EmojiPrimitive code={inline.data.code} />;
}
