import { DocumentInlineEmoji } from '@gitbook/api';

import { Emoji as EmojiPrimitive } from '@/components/primitives';

import { InlineProps } from './Inline';

export async function Emoji(props: InlineProps<DocumentInlineEmoji>) {
    const { inline } = props;

    return <EmojiPrimitive code={inline.data.code} />;
}
